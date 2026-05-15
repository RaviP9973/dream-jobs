import { requireUser } from "@/app/utils/requireUser";
import { prisma } from "@/app/utils/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PaymentSuccess({
    searchParams,
}: {
    searchParams: Promise<{ session_id?: string }>;
}) {
    const user = await requireUser();
    const params = await searchParams;
    
    // Get the session_id from URL if Stripe redirects with it
    const sessionId = params.session_id;

    // Fallback: Check for any draft jobs from this user and activate the most recent one
    // This helps in development when webhooks might not work locally
    if (user.id) {
        const company = await prisma.company.findUnique({
            where: { userId: user.id as string },
            select: { id: true },
        });

        if (company) {
            // Find the most recent draft job and activate it
            const draftJob = await prisma.jobPost.findFirst({
                where: {
                    companyId: company.id,
                    status: "DRAFT",
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            if (draftJob) {
                await prisma.jobPost.update({
                    where: { id: draftJob.id },
                    data: { status: "ACTIVE" },
                });
            }
        }
    }

    return (
        <div className="w-full min-h-screen flex
         flex-1 justify-center items-center ">
            <Card className="w-[350px]">
                <div className="p-6">
                    <div className="w-full flex justify-center">
                        <Check className="size-12 p-2 bg-green-500/30 text-green-500 rounded-full"/>
                    </div>

                    <div className="mt-3 text-center sm:mt-5 w-full"> <h2 className="text-xl font-semibold"> Payment Successful</h2>
                    <p className="text-sm mt-2 text-muted-foreground tracking-tight text-balance">Congrats your payment was successful. your job posting is now active</p>

                    <Button asChild className="w-full mt-5">
                        <Link href="/my-jobs">
                            View My Jobs
                        </Link>
                    </Button>
                    </div>

                </div>
            </Card>

        </div>
    )
}