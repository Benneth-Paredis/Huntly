import type { Job, JobStatus } from "../types";

const API_URL = "http://localhost:3001";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getJobs(): Promise<Job[]> {
  const res = await fetch(`${API_URL}/jobs`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return res.json();
}

export async function createJob(data: {
  company: string;
  position: string;
  status: JobStatus;
}): Promise<Job> {
  const res = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create job");
  }

  return res.json();
}
