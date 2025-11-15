import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BadgerTutors } from "../target/types/badger_tutors";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";

// This is a placeholder client file
// You'll implement your client logic here

export class BadgerTutorsClient {
  private program: Program<BadgerTutors>;
  private connection: Connection;
  private wallet: anchor.Wallet;

  constructor(
    connection: Connection,
    wallet: anchor.Wallet,
    programId: PublicKey
  ) {
    this.connection = connection;
    this.wallet = wallet;
    // Initialize program here once IDL is generated
    // this.program = new Program(idl, programId, { connection, wallet });
  }

  // Add your client methods here
}

