/**
 * Solana Student Registry Integration
 * This file contains stubs for Solana smart contract interactions.
 * In production, these would connect to an actual Solana program.
 */

export interface RegistryInitResult {
  success: boolean;
  message: string;
}

export interface StudentRegistration {
  studentId: string;
  email: string;
  walletPublicKey: string;
}

/**
 * Initialize the BadgerTutors registry
 */
export async function initializeRegistry(): Promise<RegistryInitResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    message: "Registry initialized successfully",
  };
}

/**
 * Register a new student in the registry
 */
export async function registerStudent(
  studentId: string,
  email: string,
  walletPublicKey: string
): Promise<RegistryInitResult> {
  // Validate student ID (10 digits)
  if (!/^\d{10}$/.test(studentId)) {
    return {
      success: false,
      message: "Student ID must be exactly 10 digits",
    };
  }

  // Validate @wisc.edu email
  if (!email.toLowerCase().endsWith("@wisc.edu")) {
    return {
      success: false,
      message: "Only @wisc.edu emails are allowed",
    };
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock validation - check if student ID already exists (random chance)
  if (Math.random() < 0.1) {
    return {
      success: false,
      message: "Student ID already registered in the system",
    };
  }

  // Mock validation - check if wallet already exists (random chance)
  if (Math.random() < 0.1) {
    return {
      success: false,
      message: "Wallet address already registered to another student",
    };
  }

  return {
    success: true,
    message: "Successfully registered with BadgerTutors Registry",
  };
}

/**
 * Verify student login with the registry
 */
export async function loginStudent(
  studentId: string,
  email: string,
  walletPublicKey: string
): Promise<RegistryInitResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock validation
  if (!/^\d{10}$/.test(studentId)) {
    return {
      success: false,
      message: "Invalid student ID format",
    };
  }

  return {
    success: true,
    message: "Student verified successfully",
  };
}

/**
 * Check if a student can review a tutor
 * CRITICAL: Reviews only allowed AFTER escrow payment is released
 */
export async function canSubmitReview(
  studentWallet: string,
  tutorId: string
): Promise<{
  canReview: boolean;
  reason?: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check 1: Has completed session WITH ESCROW RELEASED?
  const sessions = JSON.parse(localStorage.getItem("badger-tutors-sessions") || "[]");
  const completedSession = sessions.find(
    (s: any) =>
      s.studentWallet === studentWallet &&
      s.tutorId === tutorId &&
      s.status === "completed" &&
      s.escrowStatus === "released" &&
      s.paymentReleased === true
  );

  if (!completedSession) {
    return {
      canReview: false,
      reason: "You can only review after your first completed session and payment release from escrow.",
    };
  }

  // Check 2: Has already reviewed? (ONE REVIEW PER TUTOR - FOREVER)
  const reviews = JSON.parse(localStorage.getItem("badger-tutors-reviews") || "[]");
  const existingReview = reviews.find(
    (r: any) => r.studentWallet === studentWallet && r.tutorId === tutorId
  );

  if (existingReview) {
    return {
      canReview: false,
      reason: "You have already reviewed this tutor. Only one review per tutor is allowed - ever.",
    };
  }

  return { canReview: true };
}

/**
 * Submit a review to the blockchain
 */
export async function submitReview(
  studentWallet: string,
  tutorId: string,
  sessionId: string,
  rating: number,
  reviewText: string
): Promise<RegistryInitResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Validate rating
  if (rating < 1 || rating > 5) {
    return {
      success: false,
      message: "Rating must be between 1 and 5 stars",
    };
  }

  // Check eligibility again
  const eligibility = await canSubmitReview(studentWallet, tutorId);
  if (!eligibility.canReview) {
    return {
      success: false,
      message: eligibility.reason || "Cannot submit review",
    };
  }

  // Create review hash (mock)
  const reviewerHash = btoa(`${studentWallet}-${tutorId}-${Date.now()}`);
  const onChainHash = btoa(`review-${reviewerHash}-${rating}`);

  // Create review object
  const review = {
    id: `review-${Date.now()}`,
    sessionId,
    studentWallet,
    tutorId,
    rating,
    reviewText,
    timestamp: new Date().toISOString(),
    onChainHash,
    reviewerHash,
  };

  // Save review to localStorage
  const reviews = JSON.parse(localStorage.getItem("badger-tutors-reviews") || "[]");
  reviews.push(review);
  localStorage.setItem("badger-tutors-reviews", JSON.stringify(reviews));

  // Update tutor's on-chain reputation (mock)
  const tutorReviews = reviews.filter((r: any) => r.tutorId === tutorId);
  const avgRating =
    tutorReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / tutorReviews.length;
  const reputationScore = Math.round(avgRating * 20); // Scale to 100

  // Mock blockchain update
  console.log("📝 Blockchain Review Submission:", {
    tutorId,
    newRating: avgRating,
    totalReviews: tutorReviews.length,
    reputationScore,
    onChainHash,
    reviewerHash,
  });

  return {
    success: true,
    message: `Review submitted successfully! Tutor's on-chain rating updated to ${avgRating.toFixed(1)} stars.`,
  };
}
