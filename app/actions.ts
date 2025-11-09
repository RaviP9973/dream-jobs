"use server";

import { z } from "zod";
import { requireUser } from "./utils/requireUser";
import { companySchema, jobSchema, jobseekerSchema } from "./utils/zodSchemas";
import { prisma } from "./utils/db";
import { redirect } from "next/navigation";
import arcjet, { detectBot, shield } from "./utils/arcjet";
import { request } from "@arcjet/next";
import { stripe } from "./utils/stripe";
import { jobListingDurationPricing } from "./utils/jobListingDurationPricing";

const aj = arcjet
  .withRule(
    shield({
      mode: "LIVE",
    })
  )
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  );

export async function createCompany(data: z.infer<typeof companySchema>) {
  const session = await requireUser();

  const req = await request();

  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    throw new Error("Request denied by Arcjet");
  }
  const validateData = companySchema.parse(data);

  await prisma.user.update({
    where: { id: session.id },
    data: {
      onboardingComplete: true,
      userType: "COMPANY",
      Company: {
        create: {
          ...validateData,
        },
      },
    },
  });

  return redirect("/");
}

export async function createJobSeeker(data: z.infer<typeof jobseekerSchema>) {
  const user = await requireUser();

  const req = await request();

  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    throw new Error("Request denied by Arcjet");
  }

  const validateData = jobseekerSchema.parse(data);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      onboardingComplete: true,
      userType: "JOBSEEKER",
      Jobseeker: {
        create: {
          ...validateData,
        },
      },
    },
  });

  return redirect("/");
}

export async function createJob(data: z.infer<typeof jobSchema>) {
  const user = await requireUser();

  const req = await request();
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    throw new Error("Forbidden");
  }

  // Create job logic here
  const validateData = jobSchema.parse(data);

  const company = await prisma.company.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      user: {
        select: {
          stripeCustomerId: true,
        },
      },
    },
  });

  if (!company?.id) {
    return redirect("/");
  }

  let stripeCustomerId = company.user.stripeCustomerId;

  if (!stripeCustomerId) {
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: user.email as string,
      name: user.name as string,
    });

    stripeCustomerId = customer.id;

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        stripeCustomerId: stripeCustomerId,
      },
    });
  }

  const jobPost = await prisma.jobPost.create({
    data: {
      jobDescription: validateData.jobDescription,
      jobTitle: validateData.jobTitle,
      location: validateData.location,
      employmentType: validateData.employmentType,
      listingDuration: validateData.listingDuration,
      benefits: validateData.benefits,
      salaryFrom: validateData.salaryFrom,
      salaryTo: validateData.salaryTo,
      companyId: company?.id,
    },
    select: {
      id: true,
    }
  });

  const pricingTier = jobListingDurationPricing.find(
    (tier) => tier.days === validateData.listingDuration
  );

  if (!pricingTier) {
    throw new Error("Invalid listing duration selected");
  }

const session = await stripe.checkout.sessions.create({
  customer: stripeCustomerId,
  line_items: [
    {
      price_data: {
        currency: "USD",
        unit_amount: pricingTier.price * 100, // in cents
        product_data: {
          name: `Job Posting - ${pricingTier.days} Days`,
          description: pricingTier.description,
          images: [
            "https://kzfp0kl6r4.ufs.sh/f/QizcO0TRz5cPAN53b9LDc0gAC59epKda7mSiuFTMNXLxkjI1"
          ]
        }
      },
      quantity: 1
    }
  ],
  metadata: {
    jobId: jobPost.id,
  },
  mode: "payment",
  success_url: `${process.env.NEXT_PUBLIC_URL}/payment/success`,
  cancel_url: `${process.env.NEXT_PUBLIC_URL}/payment/cancel`
});

  return redirect(session.url as string);
}
