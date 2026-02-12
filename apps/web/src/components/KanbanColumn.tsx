import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Job, JobStatus } from "../types";
import { JobCard } from "./JobCard";

const columnColors: Record<JobStatus, string> = {
  APPLIED: "border-blue-300 bg-blue-50",
  INTERVIEW: "border-yellow-300 bg-yellow-50",
  OFFER: "border-green-300 bg-green-50",
  REJECTED: "border-red-300 bg-red-50",
};

const headerColors: Record<JobStatus, string> = {
  APPLIED: "text-blue-800",
  INTERVIEW: "text-yellow-800",
  OFFER: "text-green-800",
  REJECTED: "text-red-800",
};

interface KanbanColumnProps {
  status: JobStatus;
  jobs: Job[];
  onJobUpdate: (job: Job) => void;
  onJobDelete: (jobId: string) => void;
  onJobRestore: (job: Job) => void;
}

export function KanbanColumn({ status, jobs, onJobUpdate, onJobDelete, onJobRestore }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const jobIds = jobs.map((j) => j.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg border-2 p-3 min-h-[200px] transition-colors ${
        columnColors[status]
      } ${isOver ? "ring-2 ring-blue-400" : ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-sm font-bold ${headerColors[status]}`}>{status}</h2>
        <span className="text-xs text-gray-500 bg-white rounded-full px-2 py-0.5">
          {jobs.length}
        </span>
      </div>
      <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onJobUpdate={onJobUpdate} onJobDelete={onJobDelete} onJobRestore={onJobRestore} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
