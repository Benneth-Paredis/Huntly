import type { Job, JobStatus } from "../types";
import { StatusGroup } from "./StatusGroup";

const statuses: JobStatus[] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

interface JobListProps {
  jobs: Job[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
}

export function JobList({ jobs, selectedJobId, onSelectJob }: JobListProps) {
  return (
    <div className="overflow-y-auto h-full space-y-1">
      {statuses.map((status) => (
        <StatusGroup
          key={status}
          status={status}
          jobs={jobs.filter((j) => j.status === status)}
          selectedJobId={selectedJobId}
          onSelectJob={onSelectJob}
        />
      ))}
    </div>
  );
}
