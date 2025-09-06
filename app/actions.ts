"use server"

import {z} from "zod";
import { requireUser } from "./utils/requireUser"
import { companySchema, jobseekerSchema } from "./utils/zodSchemas";
import { prisma } from "./utils/db";
import { redirect } from "next/navigation";

export async function createCompany(data: z.infer<typeof companySchema>) {
    const session = await requireUser();

    const validateData = companySchema.parse(data);

    await prisma.user.update({
        where: {id: session.id},
        data: {
            onboardingComplete: true,
            userType: "COMPANY",
            Company: {
                create: {
                    ...validateData
                }
            }
        }
    })

    return redirect('/');
}

export async function createJobSeeker(data : z.infer<typeof jobseekerSchema>) {
    const user = await requireUser();

    const validateData = jobseekerSchema.parse(data);

    await prisma.user.update({
        where: {id: user.id},
        data: {
            onboardingComplete: true,
            userType: "JOBSEEKER",
            Jobseeker: {
                create: {
                    ...validateData
                }
            }
        }
    })

    return redirect('/');
}