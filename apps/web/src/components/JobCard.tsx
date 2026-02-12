import type { Job } from "../types";

const statusColors: Record<string, string> = {
  APPLIED: "bg-blue-100 text-blue-800",
  INTERVIEW: "bg-yellow-100 text-yellow-800",
  OFFER: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export function JobCard({ job }: { job: Job }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{job.company}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[job.status]}`}>
          {job.status}
        </span>
      </div>
      <p className="text-gray-600 text-sm">{job.position}</p>
      <p className="text-gray-400 text-xs mt-2">
        {new Date(job.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
