import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { getJobs, createJob, updateJob } from "../api/jobs";
import type { Job, JobStatus } from "../types";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { KanbanColumn } from "../components/KanbanColumn";

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

  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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

  function handleDragStart(event: DragStartEvent) {
    const job = jobs.find((j) => j.id === event.active.id);
    setActiveJob(job ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine the target status: either the column id itself or the status of the card we're over
    const targetStatus = statuses.includes(overId as JobStatus)
      ? (overId as JobStatus)
      : (over.data.current?.status as JobStatus | undefined);

    if (!targetStatus) return;

    const job = jobs.find((j) => j.id === activeId);
    if (!job || job.status === targetStatus) return;

    // Optimistic move during drag-over for instant visual feedback
    setJobs((prev) =>
      prev.map((j) => (j.id === activeId ? { ...j, status: targetStatus } : j))
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    const activeId = active.id as string;
    const job = jobs.find((j) => j.id === activeId);
    const originalStatus = active.data.current?.status as JobStatus;

    if (!job || job.status === originalStatus) return;

    // Already moved optimistically in handleDragOver — now persist
    try {
      await updateJob(activeId, { status: job.status });
    } catch {
      // Revert on failure
      setJobs((prev) =>
        prev.map((j) => (j.id === activeId ? { ...j, status: originalStatus } : j))
      );
    }
  }

  function handleJobUpdate(updatedJob: Job) {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  }

  function handleJobDelete(jobId: string) {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  }

  function handleJobRestore(job: Job) {
    setJobs((prev) => [...prev, job]);
  }

  const jobsByStatus = (s: JobStatus) => jobs.filter((j) => j.status === s);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">JobTrack</h1>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Add Job Application</h2>

          {error && (
            <div className="mb-3 p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : "Add Job"}
              </Button>
            </div>
          </div>
        </form>

        {loading ? (
          <p className="text-gray-500 text-center">Loading jobs...</p>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statuses.map((s) => (
                <KanbanColumn key={s} status={s} jobs={jobsByStatus(s)} onJobUpdate={handleJobUpdate} onJobDelete={handleJobDelete} onJobRestore={handleJobRestore} />
              ))}
            </div>
            <DragOverlay>
              {activeJob ? (
                <div className="border border-gray-300 rounded-lg p-3 bg-white shadow-lg rotate-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{activeJob.company}</h3>
                  <p className="text-gray-600 text-xs mt-1">{activeJob.position}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>
    </div>
  );
}
