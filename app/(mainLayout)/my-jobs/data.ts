import { prisma } from "@/app/utils/db";
import { MY_JOBS_PAGE_SIZE, type MyJobsPageResult } from "./types";

export async function getMyJobs(
  userId: string,
  cursor?: string,
  take = MY_JOBS_PAGE_SIZE,
): Promise<MyJobsPageResult> {
  const data = await prisma.jobPost.findMany({
    where: {
      Company: {
        userId,
      },
    },
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    take: take + 1,
    select: {
      id: true,
      jobTitle: true,
      status: true,
      createdAt: true,
      Company: {
        select: {
          name: true,
          logo: true,
        },
      },
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
  });

  const hasMore = data.length > take;
  const jobs = (hasMore ? data.slice(0, take) : data).map((job) => ({
    id: job.id,
    jobTitle: job.jobTitle,
    status: job.status,
    createdAt: job.createdAt.toISOString(),
    company: {
      name: job.Company.name,
      logo: job.Company.logo,
    },
  }));

  return {
    jobs,
    nextCursor: hasMore ? jobs[jobs.length - 1]?.id ?? null : null,
    hasMore,
  };
}