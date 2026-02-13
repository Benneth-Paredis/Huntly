export type JobStatus = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export interface Job {
  id: string;
  company: string;
  position: string;
  email: string | null;
  status: JobStatus;
  createdAt: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}
