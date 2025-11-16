export type UserRole = "student" | "tutor" | "both";

export type Department =
  | "COMP SCI"
  | "MATH"
  | "STAT"
  | "DS"
  | "BIOLOGY"
  | "CHEM"
  | "PHYSICS"
  | "M E"
  | "E C E";

export type GroupType = "casual" | "serious" | "exam-focused";

export type AvailabilityMode = "online" | "in-person" | "hybrid";

export interface Course {
  id: string;
  department: Department;
  courseNumber: number;
  courseTitle: string;
  lectureNumber: string;
  lectureTime: string;
  professorName: string;
  semester: string;
  difficulty: number;
  topics: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  major: string;
  graduationYear: number;
  department: Department | string;
  courses: Course[];
  walletPublicKey: string | null;
  rating: number;
  ratingCount: number;
  bio: string;
  hourlyRate: number | null;
  availability: string[];
  locations: string[];
  isTutor: boolean;
  studentId: string | null;
  phone?: string | null;
  location?: string | null;
}

export interface TutorListing {
  id: string;
  tutorUserId: string;
  tutor: User;
  coursesOffered: Course[];
  hourlyRate: number;
  rating: number;
  ratingCount: number;
  shortDescription: string;
  availableModes: AvailabilityMode[];
  campusLocations: string[];
  tags: string[];
}

export interface StudyGroup {
  id: string;
  course: Course;
  groupName: string;
  leaderUserId: string;
  leader: User;
  maxMembers: number;
  currentMembers: number;
  meetingTimes: string[];
  meetingLocation: string;
  groupType: GroupType;
  description: string;
}

export interface TutorRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  courseId: string;
  proposedTime: string;
  status: "pending" | "accepted" | "rejected";
  message: string;
  createdAt: string;
}

export interface SearchFilters {
  departments: Department[];
  majors: string[];
  graduationYears: number[];
  courseNumbers: number[];
  lectureNumbers: string[];
  professorNames: string[];
  availableDays: string[];
  minRating: number;
  maxPrice: number | null;
  minPrice: number | null;
  modes: AvailabilityMode[];
  groupTypes: GroupType[];
  searchQuery: string;
}

export interface TutoringSession {
  id: string;
  studentId: string;
  studentWallet: string;
  tutorId: string;
  courseId: string;
  scheduledTime: string;
  sessionEndTime: string;
  duration: number;
  amount: number;
  status: "scheduled" | "in-progress" | "awaiting-confirmation" | "completed" | "cancelled" | "disputed";
  escrowStatus: "pending" | "locked" | "released" | "refunded";
  escrowAccount: string | null;
  paymentReleased: boolean;
  confirmedByStudent: boolean;
  confirmedByTutor: boolean;
  studentConfirmedAt: string | null;
  tutorConfirmedAt: string | null;
  confirmationDeadline: string | null;
  autoReleaseTriggered: boolean;
  transactionHash: string | null;
  completedAt: string | null;
}

export interface Review {
  id: string;
  sessionId: string;
  studentWallet: string;
  tutorId: string;
  rating: number;
  reviewText: string;
  timestamp: string;
  onChainHash: string;
  reviewerHash: string;
}

export interface ReviewSubmission {
  tutorId: string;
  sessionId: string;
  rating: number;
  reviewText: string;
}
