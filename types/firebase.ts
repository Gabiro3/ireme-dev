export interface CategoryScore {
  name: string;
  score: number;
  feedback: string;
}

export interface Feedback {
  id?: string;
  interviewId: string;
  userId: string;
  totalScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

export interface Interview {
  id?: string;
  userId: string;
  userName: string;
  title: string;
  description?: string;
  questions?: string[];
  createdAt: string;
  updatedAt?: string;
  finalized: boolean;
  duration?: number;
  platform?: string;
}
export interface InterviewSlot {
  date: Date;
  time: string;
  available: boolean;
}

export interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: Array<{ role: string; content: string }>;
  feedbackId?: string;
}

export interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

export interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}
