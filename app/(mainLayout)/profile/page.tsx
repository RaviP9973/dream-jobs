import { requireUser } from "@/app/utils/requireUser";
import { prisma } from "@/app/utils/db";
import { redirect } from "next/navigation";
import { JobseekerProfileForm } from "@/components/forms/JobseekerProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const sessionUser = await requireUser();

  // Get full user data with userType
  const user = await prisma.user.findUnique({
    where: {
      id: sessionUser.id as string,
    },
    select: {
      userType: true,
    },
  });

  // Check if user is a job seeker
  if (user?.userType !== "JOBSEEKER") {
    redirect("/");
  }

  // Get jobseeker data
  const jobseeker = await prisma.jobseeker.findUnique({
    where: {
      userId: sessionUser.id as string,
    },
  });

  if (!jobseeker) {
    redirect("/onboarding");
  }

  console.log("Profile page - Fetched jobseeker data:", {
    userId: jobseeker.userId,
    projects: jobseeker.projects,
    projectsType: typeof jobseeker.projects,
    projectsIsArray: Array.isArray(jobseeker.projects),
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your professional profile, skills, and education details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Professional Profile</CardTitle>
            <CardDescription>
              Update your profile information to help employers find you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobseekerProfileForm jobseeker={jobseeker} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
