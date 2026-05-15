import { prisma } from "@/app/utils/db";
import { inngest } from "@/app/utils/inngest/client";
import { stripe } from "@/app/utils/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();

  const headersList = await headers();

  const signature = headersList.get("Stripe-Signature") || ("" as string);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    return new Response(`Webhook Error: ${(error as Error).message}`, {
      status: 400,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const customerId = session.customer;

    const metadata = session.metadata as {
      jobId: string;
      expirationDays: string;
    };

    const jobId = metadata.jobId;
    const expirationDays = Number(metadata.expirationDays);

    console.log("Processing payment for job:", jobId);

    if (!jobId) {
      console.error("No job ID found in metadata");
      return new Response("No job ID found in metadata", { status: 400 });
    }
    
    const company = await prisma.user.findUnique({
      where: {
        stripeCustomerId: customerId as string,
      },
      select: {
        Company: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!company?.Company) {
      console.error("No company found for customer:", customerId);
      return new Response("No company found for customer", { status: 400 });
    }

    // Update job status to ACTIVE
    await prisma.jobPost.update({
      where: {
        id: jobId,
        companyId: company.Company.id,
      },
      data: {
        status: "ACTIVE",
      },
    });

    console.log("Job updated to ACTIVE:", jobId);

    // Send inngest event for job expiration
    await inngest.send({
      name: "job/created",
      data: {
        jobId: jobId,
        expirationDays: expirationDays,
      },
    });

    console.log("Inngest event sent for job:", jobId);
  }

  return new Response(null, { status: 200 });
}
