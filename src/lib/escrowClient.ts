/**
 * Solana Escrow & Session Confirmation System
 * Implements 24-hour auto-release logic with blockchain integration
 */

import type { TutoringSession } from "@/types";

export interface EscrowResult {
  success: boolean;
  message: string;
  escrowAccount?: string;
}

/**
 * Create escrow account when student books a session
 */
export async function createEscrow(
  studentWallet: string,
  tutorWallet: string,
  amount: number,
  sessionId: string
): Promise<EscrowResult> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock escrow account creation
  const escrowAccount = btoa(`escrow-${sessionId}-${Date.now()}`);

  console.log("💰 Escrow Created:", {
    sessionId,
    studentWallet,
    tutorWallet,
    amount,
    escrowAccount,
    status: "locked",
  });

  return {
    success: true,
    message: `Escrow created: $${amount} locked until session confirmation`,
    escrowAccount,
  };
}

/**
 * Confirm session completion by student or tutor
 */
export async function confirmSession(
  sessionId: string,
  confirmerWallet: string,
  role: "student" | "tutor"
): Promise<EscrowResult> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const sessions = JSON.parse(
    localStorage.getItem("badger-tutors-sessions") || "[]"
  );
  const session = sessions.find((s: TutoringSession) => s.id === sessionId);

  if (!session) {
    return { success: false, message: "Session not found" };
  }

  if (session.status === "completed") {
    return { success: false, message: "Session already completed" };
  }

  // Update confirmation
  const now = new Date().toISOString();
  if (role === "student") {
    session.confirmedByStudent = true;
    session.studentConfirmedAt = now;
  } else {
    session.confirmedByTutor = true;
    session.tutorConfirmedAt = now;
  }

  // Check if both confirmed
  if (session.confirmedByStudent && session.confirmedByTutor) {
    // Both confirmed - immediate release
    const releaseResult = await releaseEscrow(sessionId, "both_confirmed");
    sessions[sessions.findIndex((s: TutoringSession) => s.id === sessionId)] =
      session;
    localStorage.setItem("badger-tutors-sessions", JSON.stringify(sessions));
    return releaseResult;
  }

  // Only one confirmed - set 24h deadline if not already set
  if (!session.confirmationDeadline) {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 24);
    session.confirmationDeadline = deadline.toISOString();
    session.status = "awaiting-confirmation";
  }

  sessions[sessions.findIndex((s: TutoringSession) => s.id === sessionId)] =
    session;
  localStorage.setItem("badger-tutors-sessions", JSON.stringify(sessions));

  console.log("✅ Session Confirmed:", {
    sessionId,
    role,
    confirmedByStudent: session.confirmedByStudent,
    confirmedByTutor: session.confirmedByTutor,
    deadline: session.confirmationDeadline,
  });

  return {
    success: true,
    message: `Session confirmed by ${role}. ${
      session.confirmedByStudent && session.confirmedByTutor
        ? "Payment released!"
        : "Waiting for other party (auto-release in 24h)"
    }`,
  };
}

/**
 * Release escrow to tutor
 */
export async function releaseEscrow(
  sessionId: string,
  reason: "both_confirmed" | "deadline_reached" | "admin_override"
): Promise<EscrowResult> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const sessions = JSON.parse(
    localStorage.getItem("badger-tutors-sessions") || "[]"
  );
  const sessionIndex = sessions.findIndex(
    (s: TutoringSession) => s.id === sessionId
  );

  if (sessionIndex === -1) {
    return { success: false, message: "Session not found" };
  }

  const session = sessions[sessionIndex];

  if (session.paymentReleased) {
    return { success: false, message: "Payment already released" };
  }

  // Update session status
  session.paymentReleased = true;
  session.escrowStatus = "released";
  session.status = "completed";
  session.completedAt = new Date().toISOString();
  session.autoReleaseTriggered = reason === "deadline_reached";

  // Mock blockchain transaction
  const txHash = btoa(`tx-${sessionId}-${Date.now()}`);
  session.transactionHash = txHash;

  sessions[sessionIndex] = session;
  localStorage.setItem("badger-tutors-sessions", JSON.stringify(sessions));

  console.log("💸 Escrow Released:", {
    sessionId,
    reason,
    amount: session.amount,
    tutorId: session.tutorId,
    transactionHash: txHash,
    timestamp: session.completedAt,
  });

  return {
    success: true,
    message: `Payment of $${session.amount} released to tutor. Transaction: ${txHash.slice(0, 8)}...`,
  };
}

/**
 * Check and process auto-release for sessions past deadline
 */
export async function processAutoRelease(): Promise<{
  processed: number;
  sessions: string[];
}> {
  const sessions = JSON.parse(
    localStorage.getItem("badger-tutors-sessions") || "[]"
  );
  const now = new Date();
  const processed: string[] = [];

  for (const session of sessions) {
    // Check if session needs auto-release
    if (
      session.status === "awaiting-confirmation" &&
      !session.paymentReleased &&
      session.confirmationDeadline
    ) {
      const deadline = new Date(session.confirmationDeadline);

      if (now > deadline) {
        // Deadline passed - auto-release
        await releaseEscrow(session.id, "deadline_reached");
        processed.push(session.id);
        console.log("⏰ Auto-Release Triggered:", {
          sessionId: session.id,
          deadline: session.confirmationDeadline,
          confirmedByStudent: session.confirmedByStudent,
          confirmedByTutor: session.confirmedByTutor,
        });
      }
    }
  }

  return { processed: processed.length, sessions: processed };
}

/**
 * Report a session issue/dispute
 */
export async function reportSessionIssue(
  sessionId: string,
  reporterWallet: string,
  reason: string
): Promise<EscrowResult> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const sessions = JSON.parse(
    localStorage.getItem("badger-tutors-sessions") || "[]"
  );
  const sessionIndex = sessions.findIndex(
    (s: TutoringSession) => s.id === sessionId
  );

  if (sessionIndex === -1) {
    return { success: false, message: "Session not found" };
  }

  const session = sessions[sessionIndex];
  session.status = "disputed";

  sessions[sessionIndex] = session;
  localStorage.setItem("badger-tutors-sessions", JSON.stringify(sessions));

  console.log("⚠️ Session Dispute:", {
    sessionId,
    reporterWallet,
    reason,
    escrowStatus: session.escrowStatus,
  });

  return {
    success: true,
    message:
      "Issue reported. Escrow is frozen pending review. Support will contact you within 24 hours.",
  };
}
