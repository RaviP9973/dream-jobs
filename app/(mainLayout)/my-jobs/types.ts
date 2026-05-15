export const MY_JOBS_PAGE_SIZE = 10;

export interface MyJobListing {
  id: string;
  jobTitle: string;
  status: string;
  createdAt: string;
  company: {
    name: string;
    logo: string | null;
  };
}

export interface MyJobsPageResult {
  jobs: MyJobListing[];
  nextCursor: string | null;
  hasMore: boolean;
}