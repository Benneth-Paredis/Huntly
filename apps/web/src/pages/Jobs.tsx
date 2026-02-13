import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, createJob } from "../api/jobs";
import type { Job, JobStatus } from "../types";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { JobList } from "../components/JobList";
import { JobDetail } from "../components/JobDetail";

const statuses: JobStatus[] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

export function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<JobStatus>("APPLIED");
  const [submitting, setSubmitting] = useState(false);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const selectedJob = selectedJobId
    ? jobs.find((j) => j.id === selectedJobId) ?? null
    : null;

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch(() => {
        // 401 is handled centrally by authFetch; other errors just stop loading
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const job = await createJob({ company, position, email: email || undefined, status });
      setJobs((prev) => [job, ...prev]);
      setSelectedJobId(job.id);
      setCompany("");
      setPosition("");
      setEmail("");
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

  function handleJobUpdate(updatedJob: Job) {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  }

  function handleJobDelete(jobId: string) {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
    }
  }

  function handleJobRestore(job: Job) {
    setJobs((prev) => [...prev, job]);
  }

  function handleSelectJob(jobId: string) {
    setSelectedJobId(jobId);
  }

  function handleBack() {
    setSelectedJobId(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">JobTrack</h1>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full flex flex-col min-h-0">
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-lg shadow-sm mb-6 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Add Job Application</h2>

          {error && (
            <div className="mb-3 p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
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
            <Input
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Optional"
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
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : "Add Job"}
              </Button>
            </div>
          </div>
        </form>

        {loading ? (
          <p className="text-gray-500 text-center py-12">Loading jobs...</p>
        ) : (
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Left pane - Job list */}
            <div
              className={`w-full md:w-80 md:shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden ${
                selectedJobId ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="px-4 py-3 border-b border-gray-200 shrink-0">
                <h2 className="text-sm font-semibold text-gray-700">
                  All Jobs
                  <span className="ml-2 text-gray-400 font-normal">({jobs.length})</span>
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <JobList
                  jobs={jobs}
                  selectedJobId={selectedJobId}
                  onSelectJob={handleSelectJob}
                />
              </div>
            </div>

            {/* Right pane - Job detail */}
            <div
              className={`flex-1 min-w-0 ${
                selectedJobId ? "flex" : "hidden md:flex"
              }`}
            >
              {selectedJob ? (
                <JobDetail
                  key={selectedJob.id}
                  job={selectedJob}
                  onJobUpdate={handleJobUpdate}
                  onJobDelete={handleJobDelete}
                  onJobRestore={handleJobRestore}
                  onBack={handleBack}
                />
              ) : (
                <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gray-300">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                      <path d="M14 2v6h6" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                      <path d="M10 9H8" />
                    </svg>
                    <p className="text-sm">Select a job to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
