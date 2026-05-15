import { requireUser } from "@/app/utils/requireUser";
import { EmptyState } from "@/components/general/EmptyState";
import { getMyJobs } from "./data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MyJobsTable } from "@/components/general/MyJobsTable";

export default async function MyJobsPage() {
  const session = await requireUser();
  const data = await getMyJobs(session.id as string);

  if (data.jobs.length === 0) {
    return (
      <EmptyState
        title="No job posts found"
        description="You don't have any job post yet."
        buttonText="Create a job post now!"
        href="/post-job"
      />
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Jobs</CardTitle>
        <CardDescription>
          Manage your job listings and applications here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MyJobsTable
          initialJobs={data.jobs}
          initialNextCursor={data.nextCursor}
          initialHasMore={data.hasMore}
        />
      </CardContent>
    </Card>
  );
}
