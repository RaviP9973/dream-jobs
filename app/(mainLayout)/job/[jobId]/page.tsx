import { getFlagImage } from "@/app/utils/countryList";
import { prisma } from "@/app/utils/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getJob(jobId: string) {
  const jobdata = await prisma.jobPost.findUnique({
    where: {
      status: "ACTIVE",
      id: jobId,
    },
    select: {
      jobTitle: true,
      jobDescription: true,
      location: true,
      employmentType: true,
      benefits: true,
      createdAt: true,
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

  if (!jobdata) return notFound();

  return jobdata;
}

type Params = Promise<{ jobId: string }>;

export default async function jobIdPage({ params }: { params: Params }) {
  const { jobId } = await params;
  const data = await getJob(jobId);

  const locationFlag = getFlagImage(data.location);
  return (
    <div className="grid lg:grid-cols-[1fr,400px] gap-8">
      <div className="space-y-8 ">
        {/* header */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xlfont-bold">{data?.jobTitle}</h1>

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
            </div>
          </div>

          <Button variant={"outline"}>
            <Heart className="size-4" />
            Save Job
          </Button>
        </div>

        <section>
          <p>a lot of description ....</p>
        </section>
      </div>
    </div>
  );
}
