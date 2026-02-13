import { useState, useRef, useEffect } from "react";
import type { Job, JobStatus } from "../types";
import { updateJob, deleteJob } from "../api/jobs";
import { Button } from "./Button";

const statuses: JobStatus[] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

const statusColors: Record<JobStatus, string> = {
  APPLIED: "bg-blue-100 text-blue-800",
  INTERVIEW: "bg-yellow-100 text-yellow-800",
  OFFER: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

interface JobDetailProps {
  job: Job;
  onJobUpdate: (job: Job) => void;
  onJobDelete: (jobId: string) => void;
  onJobRestore: (job: Job) => void;
  onBack: () => void;
}

export function JobDetail({ job, onJobUpdate, onJobDelete, onJobRestore, onBack }: JobDetailProps) {
  const [editMode, setEditMode] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset states when job changes
  useEffect(() => {
    setConfirmingDelete(false);
    setEditMode(false);
  }, [job.id]);

  async function handleStatusChange(newStatus: JobStatus) {
    if (newStatus === job.status) return;

    const original = { ...job };
    onJobUpdate({ ...job, status: newStatus });

    try {
      const updated = await updateJob(job.id, { status: newStatus });
      onJobUpdate(updated);
    } catch {
      onJobUpdate(original);
    }
  }

  async function handleDelete() {
    setConfirmingDelete(false);
    setDeleting(true);

    onJobDelete(job.id);

    try {
      await deleteJob(job.id);
    } catch {
      onJobRestore(job);
    }
  }

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto">
      {/* Mobile back button */}
      <div className="md:hidden border-b border-gray-200 px-4 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to list
        </button>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{job.position}</h2>
            <p className="text-sm text-gray-500 mt-1">{job.company}</p>
            {job.email && (
              <a href={`mailto:${job.email}`} className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                {job.email}
              </a>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[job.status]}`}>
              {job.status}
            </span>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`p-1.5 rounded transition-colors ${
                editMode
                  ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
              title={editMode ? "Done editing" : "Edit"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Status
            </label>
            {editMode ? (
              <select
                value={job.status}
                onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-700">{job.status}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Company
            </label>
            {editMode ? (
              <EditableInput value={job.company} field="company" job={job} onJobUpdate={onJobUpdate} />
            ) : (
              <p className="text-sm text-gray-700">{job.company}</p>
            )}
          </div>

          {/* Position */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Position
            </label>
            {editMode ? (
              <EditableInput value={job.position} field="position" job={job} onJobUpdate={onJobUpdate} />
            ) : (
              <p className="text-sm text-gray-700">{job.position}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Contact Email
            </label>
            {editMode ? (
              <EditableInput
                value={job.email ?? ""}
                field="email"
                job={job}
                onJobUpdate={onJobUpdate}
                type="email"
                placeholder="Add email..."
              />
            ) : (
              job.email ? (
                <a href={`mailto:${job.email}`} className="text-sm text-blue-600 hover:underline">
                  {job.email}
                </a>
              ) : (
                <p className="text-sm text-gray-400 italic">No email</p>
              )
            )}
          </div>

          {/* Timestamps */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Created
            </label>
            <p className="text-sm text-gray-700">
              {new Date(job.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" at "}
              {new Date(job.createdAt).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Delete */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          {confirmingDelete ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Delete this job?</span>
              <Button
                variant="primary"
                onClick={handleDelete}
                disabled={deleting}
                className="!bg-red-600 hover:!bg-red-700 text-sm"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setConfirmingDelete(false)}
                className="text-sm"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Delete job
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Editable input field for edit mode
function EditableInput({
  value,
  field,
  job,
  onJobUpdate,
  type = "text",
  placeholder,
}: {
  value: string;
  field: "company" | "position" | "email";
  job: Job;
  onJobUpdate: (job: Job) => void;
  type?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  async function save() {
    const trimmed = draft.trim();
    // For email, allow empty (null) to clear the field
    const newValue = field === "email" ? (trimmed || null) : trimmed;
    const currentValue = field === "email" ? (job.email || null) : job[field];

    if (newValue === currentValue) {
      setDraft(value);
      return;
    }
    // Don't allow empty company/position
    if (field !== "email" && !trimmed) {
      setDraft(value);
      return;
    }

    setSaving(true);
    const original = { ...job };
    onJobUpdate({ ...job, [field]: newValue });

    try {
      const updated = await updateJob(job.id, { [field]: newValue });
      onJobUpdate(updated);
    } catch {
      onJobUpdate(original);
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); save(); }
    else if (e.key === "Escape") { setDraft(value); }
  }

  return (
    <input
      ref={inputRef}
      type={type}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={handleKeyDown}
      disabled={saving}
      placeholder={placeholder}
      className={`w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        saving ? "opacity-50" : ""
      }`}
    />
  );
}
