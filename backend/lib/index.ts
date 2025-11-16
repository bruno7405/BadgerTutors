import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { IDL, BadgerTutors } from "./idl";
import { BN } from "@coral-xyz/anchor";

export const PROGRAM_ID = new PublicKey("BadgerTutors111111111111111111111111111");

export interface EscrowAccount {
  student: PublicKey;
  tutor: PublicKey;
  sessionId: string;
  amount: BN;
  status: { locked: {} } | { awaitingConfirmation: {} } | { released: {} } | { cancelled: {} };
  confirmedByStudent: boolean;
  confirmedByTutor: boolean;
  studentConfirmedAt: BN | null;
  tutorConfirmedAt: BN | null;
  createdAt: BN;
  confirmationDeadline: BN;
  releasedAt: BN | null;
}

export interface RatingAccount {
  tutor: PublicKey;
  student: PublicKey;
  sessionId: string;
  rating: number;
  reviewText: string;
  createdAt: BN;
}

export interface TutorRating {
  tutor: PublicKey;
  totalRatings: BN;
  totalScore: BN;
  averageRating: number;
}

export class BadgerTutorsClient {
  private program: Program<BadgerTutors>;
  private connection: Connection;
  private wallet: Wallet;

  constructor(connection: Connection, wallet: Wallet) {
    this.connection = connection;
    this.wallet = wallet;
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    this.program = new Program(IDL, PROGRAM_ID, provider);
  }

  /**
   * Student pays SOL into escrow for a tutoring session
   */
  async paySolana(
    tutorPublicKey: PublicKey,
    sessionId: string,
    amountSol: number
  ): Promise<string> {
    const amount = new BN(amountSol * LAMPORTS_PER_SOL);
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        Buffer.from(sessionId),
        this.wallet.publicKey.toBuffer(),
      ],
      this.program.programId
    );

    const tx = await this.program.methods
      .paySolana(sessionId, amount)
      .accounts({
        student: this.wallet.publicKey,
        tutor: tutorPublicKey,
        escrow: escrowPda,
        escrowAccount: escrowPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Confirm session completion (can be called by student or tutor)
   */
  async confirmSession(escrowPda: PublicKey, isStudent: boolean): Promise<string> {
    const tx = await this.program.methods
      .confirmSession(isStudent)
      .accounts({
        confirmer: this.wallet.publicKey,
        escrow: escrowPda,
      })
      .rpc();

    return tx;
  }

  /**
   * Tutor receives payment after confirmation
   */
  async receiveSolana(escrowPda: PublicKey): Promise<string> {
    const escrow = await this.program.account.escrowAccount.fetch(escrowPda);
    
    const tx = await this.program.methods
      .receiveSolana()
      .accounts({
        tutor: this.wallet.publicKey,
        escrow: escrowPda,
        escrowAccount: escrowPda,
      })
      .rpc();

    return tx;
  }

  /**
   * Update tutor rating after session completion
   */
  async updateRating(
    tutorPublicKey: PublicKey,
    escrowPda: PublicKey,
    rating: number,
    reviewText: string
  ): Promise<string> {
    const escrow = await this.program.account.escrowAccount.fetch(escrowPda);
    
    const [ratingPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("rating"),
        Buffer.from(escrow.sessionId),
        this.wallet.publicKey.toBuffer(),
      ],
      this.program.programId
    );

    const [tutorRatingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("tutor_rating"), tutorPublicKey.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .updateRating(rating, reviewText)
      .accounts({
        student: this.wallet.publicKey,
        tutor: tutorPublicKey,
        escrow: escrowPda,
        ratingAccount: ratingPda,
        tutorRating: tutorRatingPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Cancel session and refund student
   */
  async cancelSession(escrowPda: PublicKey): Promise<string> {
    const tx = await this.program.methods
      .cancelSession()
      .accounts({
        student: this.wallet.publicKey,
        escrow: escrowPda,
        escrowAccount: escrowPda,
      })
      .rpc();

    return tx;
  }

  /**
   * Get escrow account data
   */
  async getEscrow(escrowPda: PublicKey): Promise<EscrowAccount | null> {
    try {
      const account = await this.program.account.escrowAccount.fetch(escrowPda);
      return account as EscrowAccount;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get tutor rating
   */
  async getTutorRating(tutorPublicKey: PublicKey): Promise<TutorRating | null> {
    try {
      const [tutorRatingPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("tutor_rating"), tutorPublicKey.toBuffer()],
        this.program.programId
      );
      const account = await this.program.account.tutorRating.fetch(tutorRatingPda);
      return account as TutorRating;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find escrow PDA from session ID and student
   */
  findEscrowPda(sessionId: string, studentPublicKey: PublicKey): PublicKey {
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        Buffer.from(sessionId),
        studentPublicKey.toBuffer(),
      ],
      this.program.programId
    );
    return escrowPda;
  }
}

