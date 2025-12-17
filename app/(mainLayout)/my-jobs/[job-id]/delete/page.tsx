import { deleteJobPost } from "@/app/actions";
import { requireUser } from "@/app/utils/requireUser";
import GeneralSubmitButton from "@/components/general/SubmitButton";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, TrashIcon } from "lucide-react";
import Link from "next/link";

type Params = Promise<{ "job-id": string }>;
export default async function DeleteJob({ params }: { params: Params }) {
  const { "job-id": jobId } = await params;

  console.log("Job ID:", jobId);
  await requireUser();
  return (
    <div>
      <Card className="max-w-lg mx-auto  mt-28">
        <CardHeader>
          <CardTitle>Are you sure you want to delete this job post?</CardTitle>
          <CardDescription>
            This action cannot be undone. This will permanently delete the job
            post from our servers.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex items-center justify-between  ">
          <Link
            href="/my-jobs"
            className={buttonVariants({ variant: "secondary" })}
          >
            <ArrowLeft /> Cancel
          </Link>

          <form
            action={async () => {
              "use server";
              await deleteJobPost(jobId);
            }}
          >
            <GeneralSubmitButton
              text="Delete job"
              variant="destructive"
              icon={<TrashIcon />}
            />
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
