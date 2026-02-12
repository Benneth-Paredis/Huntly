import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Job } from "../types";
import { updateJob, deleteJob } from "../api/jobs";

interface JobCardProps {
  job: Job;
  onJobUpdate: (job: Job) => void;
  onJobDelete: (jobId: string) => void;
  onJobRestore: (job: Job) => void;
}

export function JobCard({ job, onJobUpdate, onJobDelete, onJobRestore }: JobCardProps) {
  const [editMode, setEditMode] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
    data: { status: job.status },
    disabled: editMode || confirmingDelete,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function exitEditMode() {
    setEditMode(false);
  }

  async function handleDelete() {
    setConfirmingDelete(false);
    setDeleting(true);

    // Optimistic removal
    onJobDelete(job.id);

    try {
      await deleteJob(job.id);
    } catch {
      // Restore on failure
      onJobRestore(job);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(editMode || confirmingDelete ? {} : listeners)}
      className={`border rounded-lg bg-white shadow-sm relative ${
        confirmingDelete ? "border-red-300" : "border-gray-200"
      } ${editMode || confirmingDelete ? "" : "cursor-grab active:cursor-grabbing"} ${
        deleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Action buttons */}
      {!confirmingDelete && (
        <div className="absolute top-2 right-2 flex gap-1">
          {!editMode && !isDragging && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmingDelete(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 rounded transition-colors text-gray-300 hover:text-red-500 hover:bg-red-50"
              title="Delete"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditMode(!editMode);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className={`p-1 rounded transition-colors ${
              editMode
                ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
            }`}
            title={editMode ? "Done editing" : "Edit"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
        </div>
      )}

      {/* Inline delete confirmation */}
      {confirmingDelete && (
        <div
          className="absolute inset-0 bg-white/95 rounded-lg flex items-center justify-center gap-2 z-10"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-gray-600">Delete?</span>
          <button
            onClick={handleDelete}
            className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirmingDelete(false)}
            className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            No
          </button>
        </div>
      )}

      {/* Card content */}
      <div className="p-3 pr-14">
        <EditableField
          value={job.company}
          field="company"
          jobId={job.id}
          job={job}
          onJobUpdate={onJobUpdate}
          editMode={editMode}
          onDone={exitEditMode}
          className="font-semibold text-gray-900 text-sm"
        />
        <EditableField
          value={job.position}
          field="position"
          jobId={job.id}
          job={job}
          onJobUpdate={onJobUpdate}
          editMode={editMode}
          onDone={exitEditMode}
          className="text-gray-600 text-xs mt-1"
        />
        <p className="text-gray-400 text-xs mt-2">
          {new Date(job.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

interface EditableFieldProps {
  value: string;
  field: "company" | "position";
  jobId: string;
  job: Job;
  onJobUpdate: (job: Job) => void;
  editMode: boolean;
  onDone: () => void;
  className: string;
}

function EditableField({ value, field, jobId, job, onJobUpdate, editMode, onDone, className }: EditableFieldProps) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editMode && field === "company" && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editMode, field]);

  useEffect(() => {
    if (!editMode) setDraft(value);
  }, [value, editMode]);

  function cancel() {
    setDraft(value);
    onDone();
  }

  async function save() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      setDraft(value);
      return;
    }

    setSaving(true);

    const optimistic = { ...job, [field]: trimmed };
    onJobUpdate(optimistic);

    try {
      const updated = await updateJob(jobId, { [field]: trimmed });
      onJobUpdate(updated);
    } catch {
      onJobUpdate(job);
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      cancel();
    }
  }

  if (editMode) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => e.stopPropagation()}
        className={`${className} w-full bg-blue-50 border border-blue-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-400`}
      />
    );
  }

  return (
    <p className={`${className} px-1 py-0.5 truncate ${saving ? "opacity-50" : ""}`}>
      {value}
    </p>
  );
}
