import type { TutoringSession } from "@/types";

/**
 * Initialize mock tutoring sessions in localStorage
 * This simulates completed sessions for testing the review system
 */
export const initializeMockSessions = () => {
  const existingSessions = localStorage.getItem("badger-tutors-sessions");
  
  // Only initialize if no sessions exist
  if (existingSessions) return;

  const mockSessions: TutoringSession[] = [
    // Completed sessions - eligible for review
    {
      id: "session-001",
      studentId: "user-1",
      studentWallet: "3Fsx7a8k9QaT",
      tutorId: "tutor-1",
      courseId: "CS300",
      scheduledTime: "2025-01-10T14:00:00Z",
      sessionEndTime: "2025-01-10T15:00:00Z",
      duration: 60,
      amount: 30,
      status: "completed",
      escrowStatus: "released",
      escrowAccount: "escrow-001",
      paymentReleased: true,
      confirmedByStudent: true,
      confirmedByTutor: true,
      studentConfirmedAt: "2025-01-10T15:05:00Z",
      tutorConfirmedAt: "2025-01-10T15:03:00Z",
      confirmationDeadline: null,
      autoReleaseTriggered: false,
      transactionHash: "5FpqZ3...Xy9Qa",
      completedAt: "2025-01-10T15:05:00Z",
    },
    {
      id: "session-002",
      studentId: "user-1",
      studentWallet: "3Fsx7a8k9QaT",
      tutorId: "tutor-2",
      courseId: "MATH340",
      scheduledTime: "2025-01-12T10:00:00Z",
      sessionEndTime: "2025-01-12T11:30:00Z",
      duration: 90,
      amount: 45,
      status: "completed",
      escrowStatus: "released",
      escrowAccount: "escrow-002",
      paymentReleased: true,
      confirmedByStudent: true,
      confirmedByTutor: true,
      studentConfirmedAt: "2025-01-12T11:40:00Z",
      tutorConfirmedAt: "2025-01-12T11:35:00Z",
      confirmationDeadline: null,
      autoReleaseTriggered: false,
      transactionHash: "8KvnR2...Mn4Zx",
      completedAt: "2025-01-12T11:40:00Z",
    },
    // Awaiting confirmation - test auto-release
    {
      id: "session-003",
      studentId: "user-1",
      studentWallet: "3Fsx7a8k9QaT",
      tutorId: "tutor-3",
      courseId: "STAT240",
      scheduledTime: "2025-01-15T16:00:00Z",
      sessionEndTime: "2025-01-15T17:00:00Z",
      duration: 60,
      amount: 25,
      status: "awaiting-confirmation",
      escrowStatus: "locked",
      escrowAccount: "escrow-003",
      paymentReleased: false,
      confirmedByStudent: false,
      confirmedByTutor: true,
      studentConfirmedAt: null,
      tutorConfirmedAt: "2025-01-15T17:05:00Z",
      confirmationDeadline: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), // 20 hours from now
      autoReleaseTriggered: false,
      transactionHash: null,
      completedAt: null,
    },
    // Scheduled session - not yet started
    {
      id: "session-004",
      studentId: "user-1",
      studentWallet: "3Fsx7a8k9QaT",
      tutorId: "tutor-1",
      courseId: "CS400",
      scheduledTime: "2025-01-25T14:00:00Z",
      sessionEndTime: "2025-01-25T15:30:00Z",
      duration: 90,
      amount: 40,
      status: "scheduled",
      escrowStatus: "pending",
      escrowAccount: null,
      paymentReleased: false,
      confirmedByStudent: false,
      confirmedByTutor: false,
      studentConfirmedAt: null,
      tutorConfirmedAt: null,
      confirmationDeadline: null,
      autoReleaseTriggered: false,
      transactionHash: null,
      completedAt: null,
    },
  ];

  localStorage.setItem("badger-tutors-sessions", JSON.stringify(mockSessions));
};

/**
 * Get all sessions for a student
 */
export const getStudentSessions = (studentWallet: string): TutoringSession[] => {
  const sessions = JSON.parse(
    localStorage.getItem("badger-tutors-sessions") || "[]"
  );
  return sessions.filter((s: TutoringSession) => s.studentWallet === studentWallet);
};

/**
 * Get completed sessions with a specific tutor
 */
export const getCompletedSessionsWithTutor = (
  studentWallet: string,
  tutorId: string
): TutoringSession[] => {
  const sessions = getStudentSessions(studentWallet);
  return sessions.filter(
    (s) =>
      s.tutorId === tutorId &&
      s.status === "completed" &&
      s.paymentReleased &&
      s.confirmedByStudent &&
      s.confirmedByTutor
  );
};
