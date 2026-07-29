import arcjet, {
  detectBot,
  tokenBucket,
} from "@/app/utils/arcjet";
import { auth } from "@/app/utils/auth";
import { getFlagImage } from "@/app/utils/countryList";
import { prisma } from "@/app/utils/db";
import { formatCurrency } from "@/app/utils/formatCurrency";
import { benefits } from "@/app/utils/listOfBenefits";
import { JsonToHtml } from "@/components/general/JsonToHtml";
import { SaveJobButton } from "@/components/general/SubmitButton";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { request } from "@arcjet/next";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResumeUploadSection } from "@/components/general/ResumeUploadSection";
import { JobPostStatus } from "@prisma/client";
import type { Metadata } from "next";
import { cache } from "react";

const aj = arcjet.withRule(
  detectBot({
    mode: "LIVE",
    allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
  })
);

function getClient(session: boolean) {
  if (session) {
    return aj.withRule(
      tokenBucket({
        mode: "DRY_RUN",
        capacity: 100,
        interval: 60,
        refillRate: 30,
      })
    );
  } else {
    return aj.withRule(
      tokenBucket({
        mode: "DRY_RUN",
        capacity: 100,
        interval: 60,
        refillRate: 10,
      })
    );
  }
}

const getCachedJob = cache(async (jobId: string) => {
  return await prisma.jobPost.findUnique({
    where: {
      status: JobPostStatus.ACTIVE,
      id: jobId,
    },
    select: {
      jobTitle: true,
      jobDescription: true,
      location: true,
      employmentType: true,
      benefits: true,
      createdAt: true,
      listingDuration: true,
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
  });
});

async function getJob(jobId: string, userId?: string) {
  console.log("userId", userId);
  const [jobData, savedJob, jobseeker, existingApplication] = await Promise.all([
    getCachedJob(jobId),

    userId
      ? prisma.savedJobPost.findUnique({
        where: {
          userId_jobPostId: {
            userId: userId,
            jobPostId: jobId,
          },
        },
        select: {
          id: true,
        },
      })
      : null,

    userId
      ? prisma.jobseeker.findUnique({
        where: { userId: userId },
        select: {
          id: true,
          about: true,
          resume: true,
          name: true,
        },
      })
      : null,

    userId
      ? prisma.jobApplication.findUnique({
        where: {
          userId_jobPostId: {
            userId: userId,
            jobPostId: jobId,
          },
        },
        select: {
          id: true,
          status: true,
        },
      })
      : null,
  ]);

  if (!jobData) return notFound();

  return { jobData, savedJob, jobseeker, existingApplication };
}

type Params = Promise<{ jobId: string; userID?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { jobId } = await params;
  const job = await getCachedJob(jobId);
  if (!job) return { title: "Job Not Found" };

  const title = `${job.jobTitle} at ${job.Company.name}`;
  const description = `${job.employmentType} · ${job.location} · ${formatCurrency(job.salaryFrom)}–${formatCurrency(job.salaryTo)}. Apply now on Dream Jobs.`;

  return {
    title,
    description,
    openGraph: {
      title, description,
      type: "website",
      images: job.Company.logo ? [{ url: job.Company.logo }] : [],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function jobIdPage({ params }: { params: Params }) {
  const { jobId } = await params;
  const session = await auth();
  const req = await request();
  const decision = await getClient(!!session).protect(req, { requested: 10 });

  if (decision.isDenied()) {
    throw new Error("Forbidden");
  }

  const {
    jobData: data,
    savedJob,
    jobseeker,
    existingApplication,
  } = await getJob(jobId, session?.user?.id);

  const locationFlag = getFlagImage(data.location);
  return (
    <article className="grid lg:grid-cols-3 gap-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: data.jobTitle,
            description: data.jobDescription,
            datePosted: data.createdAt.toISOString(),
            validThrough: new Date(data.createdAt.getTime() + data.listingDuration * 24 * 60 * 60 * 1000).toISOString(),
            employmentType: data.employmentType,
            hiringOrganization: {
              "@type": "Organization",
              name: data.Company.name,
              logo: data.Company.logo,
            },
            jobLocation: {
              "@type": "Place",
              name: data.location,
            },
            baseSalary: {
              "@type": "MonetaryAmount",
              currency: "USD",
              value: {
                "@type": "QuantitativeValue",
                minValue: data.salaryFrom,
                maxValue: data.salaryTo,
                unitText: "YEAR",
              },
            },
          }),
        }}
      />
      <div className="space-y-8 col-span-2">
        {/* header */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{data?.jobTitle}</h1>

            <div className="flex items-center mt-2 gap-2">
              <p className="font-medium">{data?.Company?.name}</p>
              <span className="hidden md:inline text-muted-foreground">*</span>
              <Badge className="rounded-full " variant={"secondary"}>
                {data?.employmentType}
              </Badge>
              <span className="hidden md:inline text-muted-foreground">*</span>

              <Badge className="rounded-full">
                {locationFlag && (
                  <span>
                    <Image
                      src={locationFlag}
                      alt={data?.location}
                      width={16}
                      height={16}
                      className="inline-block rounded-sm mr-1"
                    />
                  </span>
                )}
                {data?.location}
              </Badge>
              <span className="hidden md:inline text-muted-foreground">*</span>

              <p className="text-sm text-muted-foreground">
                {formatCurrency(data.salaryFrom)} -{" "}
                {formatCurrency(data.salaryTo)}
              </p>
            </div>
          </div>

          {session?.user ? (
            <SaveJobButton
              savedJob={!!savedJob}
              jobId={jobId}
              savedJobId={savedJob?.id}
            />
          ) : (
            <Link
              href={"/login"}
              className={buttonVariants({ variant: "outline" })}
            >
              <Heart className="size-4" />
              Save Job
            </Link>
          )}
        </div>

        <section>
          <JsonToHtml json={JSON.parse(data.jobDescription)} />
        </section>

        <section>
          <h3 className="font-semibold mb-4 ">
            Benfits{" "}
            <span className="text-sm text-muted-foreground font-normal">
              (blue is offered)
            </span>
          </h3>

          <div className="flex flex-wrap gap-3 ">
            {benefits.map((benefit) => {
              const isOffered = data.benefits.includes(benefit.id);

              return (
                <Badge
                  key={benefit.id}
                  className={cn(
                    isOffered ? "" : "opacity-75 cursor-not-allowed ",
                    "text-sm px-4 py-1.5 rounded-full"
                  )}
                  variant={isOffered ? "default" : "outline"}
                >
                  <span className="flex items-center gap-2">
                    {benefit.icon}
                    {benefit.label}
                  </span>
                </Badge>
              );
            })}
          </div>
        </section>
      </div>

      <div className="space-y-6 ">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Apply now</h3>
              <p className="text-sm text-muted-foreground ">
                Please let {data.Company.name} know you found this job on Dream
                Jobs. This helps us grow!
              </p>
            </div>

            {/* Jobseeker Details & Resume */}
            {session?.user && jobseeker && !existingApplication && (
              <ResumeUploadSection
                currentResume={jobseeker.resume}
                jobseekerName={jobseeker.name || ""}
                userEmail={session.user.email || ""}
                jobId={jobId}
              />
            )}

            {session?.user && existingApplication && (
              <div className="border rounded-lg p-4 bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-sm font-medium">You have already applied to this job</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current status: <span className="font-medium capitalize">{existingApplication.status.toLowerCase().replace("_", " ")}</span>
                </p>
              </div>
            )}

            {!session?.user && (
              <Link href="/login" className="block">
                <Button className="w-full">Apply now</Button>
              </Link>
            )}
          </div>
        </Card>
        {/* job details card */}
        <Card className="p-6 ">
          <h3 className="font-semibold ">About the Job</h3>
          <div className="space-y-2 ">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Apply before
              </span>
              <span className="text-sm ">
                {new Date(
                  data.createdAt.getTime() +
                  data.listingDuration * 24 * 60 * 60 * 1000
                ).toLocaleDateString("en-Us", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between ">
              <span className="text-sm text-muted-foreground">Posted On</span>
              <span className="text-sm ">
                {data.createdAt.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between ">
              <span className="text-sm text-muted-foreground">
                Employement Type
              </span>
              <span className="text-sm ">{data.employmentType}</span>
            </div>
            <div className="flex justify-between ">
              <span className="text-sm text-muted-foreground">Location</span>
              <span className="text-sm ">
                {locationFlag && (
                  <span>
                    <Image
                      src={locationFlag}
                      alt={data?.location}
                      width={16}
                      height={16}
                      className="inline-block rounded-sm mr-1"
                    />
                  </span>
                )}
                {data.location}
              </span>
            </div>
          </div>
        </Card>

        {/* company card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 ">
              <Image
                src={data.Company.logo || ""}
                alt={`${data.Company.name} logo`}
                width={48}
                height={48}
                className="rounded-full size-12"
              />

              <div className="flex flex-col ">
                <h3 className="font-semibold">{data.Company.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {data.Company.about}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </article>
  );
}
