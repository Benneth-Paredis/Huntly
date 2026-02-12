export type JobStatus = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export interface Job {
  id: string;
  company: string;
  position: string;
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
