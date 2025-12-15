import { auth } from "@/app/utils/auth";
import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/requireUser";
import { EmptyState } from "@/components/general/EmptyState";
import { JobCard } from "@/components/general/JobCard";

async function getFevorites(userId: string) {
  const data = await prisma.savedJobPost.findMany({
    where: {
      userId: userId,
    },
    select: {
      jobPost: {
        select: {
          id: true,
          jobTitle: true,
          location: true,
          employmentType: true,
          createdAt: true,
          salaryFrom: true,
          salaryTo: true,
          Company: {
            select: {
              name: true,
              logo: true,
              location: true,
              about: true,
            },
          },
        },
      },
    },
  });

  return data;
}

export default async function FavoritesPage() {
  const session = await requireUser();

  const data = await getFevorites(session?.id as string);

  if (data.length === 0) {
    return (
      <EmptyState
        title="No Favorites Found"
        description="You don't have any favorites yet"
        buttonText="Find a job"
        href="/"
      />
    );
  }
  return (
    <div className="grid grid-cols-1 mt-5 gap-4">
      {" "}
      {data.map((favorite) => (
        <JobCard key={favorite.jobPost.id} job={favorite.jobPost} />
      ))}
    </div>
  );
}
