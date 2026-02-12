import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, createJob } from "../api/jobs";
import type { Job, JobStatus } from "../types";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { JobCard } from "../components/JobCard";

const statuses: JobStatus[] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

export function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<JobStatus>("APPLIED");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const job = await createJob({ company, position, status });
      setJobs((prev) => [job, ...prev]);
      setCompany("");
      setPosition("");
      setStatus("APPLIED");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">JobTrack</h1>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Add Job Application</h2>

          {error && (
            <div className="mb-3 p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Company"
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
            <Input
              label="Position"
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" className="mt-3" disabled={submitting}>
            {submitting ? "Adding..." : "Add Job"}
          </Button>
        </form>

        {loading ? (
          <p className="text-gray-500 text-center">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500 text-center">No jobs yet. Add your first application above.</p>
        ) : (
          <div className="grid gap-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
