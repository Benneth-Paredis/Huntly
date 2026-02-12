import type { Job, JobStatus } from "../types";

const API_URL = "http://localhost:3001";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function authFetch(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login?expired=1";
    throw new Error("Session expired");
  }

  return res;
}

export async function getJobs(): Promise<Job[]> {
  const res = await authFetch(`${API_URL}/jobs`, {
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
  const res = await authFetch(`${API_URL}/jobs`, {
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

export async function updateJob(id: string, data: Partial<Pick<Job, "company" | "position" | "status">>): Promise<Job> {
  const res = await authFetch(`${API_URL}/jobs/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update job");
  }

  return res.json();
}

export async function deleteJob(id: string): Promise<void> {
  const res = await authFetch(`${API_URL}/jobs/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete job");
  }
}
