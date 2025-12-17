import { prisma } from "@/app/utils/db";
import { inngest } from "@/app/utils/inngest/client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

export const handleJobExpiration = inngest.createFunction(
  {
    id: "job-expiration", cancelOn: [{
      event: 'job/cancel.expiration',
      if: 'event.data.jobId == async.data.jobId'
    }]
  },
  {
    event: "job/created",
  },
  async ({ event, step }) => {
    const { jobId, expirationDays } = event.data;

    await step.sleep("wait-until-expiration", `${expirationDays}d`);

    await step.run("update-job-status", async () => {
      await prisma.jobPost.update({
        where: {
          id: jobId,
        },
        data: {
          status: "EXPIRED",
        },
      });
    });

    return { jobId, message: "Job status updated to EXPIRED" };
  }
);

export const sendPeriodicJobListing = inngest.createFunction(
  { id: "send-job-listings" },
  { event: "jobseeker/created" },
  async ({ event, step }) => {
    const { userId } = event.data;

    const totalDays = 30;
    const intervalDays = 2;
    let currentDay = 0;

    while (currentDay < totalDays) {
      await step.sleep("wait-interval", `${intervalDays}d`);
      currentDay += intervalDays;
      const recentJobs = await step.run("fetch-recent-jobs", async () => {
        return await prisma.jobPost.findMany({
          where: {
            status: "ACTIVE",
          },
          take: 10,
          include: {
            Company: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      });

      if (recentJobs.length > 0) {
        await step.run("send-email", async () => {
          const jobListingHtml = recentJobs
            .map(
              (job: typeof recentJobs[number]) =>
                // html template for all these jobs
                `
                <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 15px; border-radius: 5px;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">${job.jobTitle}</h3>
                  <p style="margin: 5px 0; color: #666;">
                    <strong>Company:</strong> ${job.Company?.name || 'N/A'}
                  </p>
                  <p style="margin: 5px 0; color: #666;">
                    <strong>Location:</strong> ${job.location}
                  </p>
                  <p style="margin: 5px 0; color: #666;">
                    <strong>Type:</strong> ${job.employmentType}
                  </p>
                  <p style="margin: 5px 0; color: #666;">
                    <strong>Salary:</strong> ₹${job.salaryFrom.toLocaleString()} - ₹${job.salaryTo.toLocaleString()}
                  </p>
                  <a 
                    href="${process.env.NEXT_PUBLIC_URL}/job/${job.id}"
                    style="display: inline-block; margin-top: 10px; background-color: #007bff; 
                          color: white; padding: 8px 16px; text-decoration: none; border-radius: 3px;"
                  >
                    View Details
                  </a>
                </div>
                `
            )
            .join("");

          await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: 'rp031776@gmail.com',
            subject: "Latest Job opportunities for You",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Latest Job Opportunities</h2>

            ${jobListingHtml}

            <div style="margin-top: 30px; text-align: center;">
              <a 
                href="${process.env.NEXT_PUBLIC_URL}"
                style="background-color: #007bff; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px;"
              >
                View More Jobs
              </a>
            </div>
          </div>
`,

          });
        });
      }
    }

    return {userId, message: 'Completed 30 day job listing notifications'}
  }
);
