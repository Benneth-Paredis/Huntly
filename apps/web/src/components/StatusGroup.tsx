import { useState } from "react";
import type { Job, JobStatus } from "../types";

const statusDotColors: Record<JobStatus, string> = {
  APPLIED: "bg-blue-500",
  INTERVIEW: "bg-yellow-500",
  OFFER: "bg-green-500",
  REJECTED: "bg-red-500",
};

interface StatusGroupProps {
  status: JobStatus;
  jobs: Job[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
}

export function StatusGroup({ status, jobs, selectedJobId, onSelectJob }: StatusGroupProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotColors[status]}`} />
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex-1 text-left">
          {status}
        </span>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
          {jobs.length}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-gray-400 transition-transform ${collapsed ? "-rotate-90" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {!collapsed && (
        <div className="mt-0.5">
          {jobs.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400 italic">No jobs</p>
          ) : (
            jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedJobId === job.id
                    ? "bg-blue-50 border-l-2 border-blue-600"
                    : "hover:bg-gray-50 border-l-2 border-transparent"
                }`}
              >
                <p className="text-sm font-medium text-gray-900 truncate">{job.position}</p>
                <p className="text-xs text-gray-500 truncate">{job.company}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
