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

    if (!jobId) {
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

    if (!company) {
      return new Response("No company found for customer", { status: 400 });
    }

    await prisma.jobPost.update({
      where: {
        id: jobId,
        companyId: company?.Company?.id as string,
      },
      data: {
        status: "ACTIVE",
      },
    });

    await inngest.send({
      name: "job/created",
      data: {
        jobId: jobId,
        expirationDays: expirationDays,
      },
    });
  }

  return new Response(null, { status: 200 });
}
