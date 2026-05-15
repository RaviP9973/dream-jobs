import { prisma } from "@/app/utils/db";
import { notFound } from "next/navigation";
import { Mail, Calendar, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateApplicationStatus } from "@/app/actions";
import { ApplicationStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ModalWrapper } from "./ModalWrapper";

// Status Helper for UI
const statusConfig: Record<ApplicationStatus, { label: string, color: string }> = {
  PENDING: { label: "Pending", color: "bg-slate-500" },
  IN_REVIEW: { label: "In Review", color: "bg-yellow-500 text-black" },
  INTERVIEW: { label: "Interview", color: "bg-blue-500" },
  OFFER: { label: "Offer", color: "bg-green-600" },
  REJECTED: { label: "Rejected", color: "bg-red-600" },
};

export default async function ResumeModal({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ applicationId: string, "job-id": string }>,
  searchParams: Promise<{ url?: string }>
}) {
  const { applicationId, "job-id": jobId } = await params;
  const { url } = await searchParams;
  
  // Fetch application with user details
  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: {
      User: {
        include: {
          Jobseeker: true
        }
      },
      JobPost: {
        select: {
          jobTitle: true,
          id: true
        }
      }
    }
  });

  if (!application) return notFound();

  const resumeUrl = url || application.resume;

  return (
    <ModalWrapper>
      <div 
        className="relative bg-background w-full max-w-7xl h-[90vh] rounded-lg shadow-lg flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Application Review</h2>
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Resume (70%) */}
          <div className="w-[70%] border-r">
            {resumeUrl ? (
              <iframe
                src={`${resumeUrl}#toolbar=0`}
                className="w-full h-full border-0"
                title="Resume Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading resume...</p>
              </div>
            )}
          </div>

          {/* Right Side - Applicant Info & Actions (30%) */}
          <div className="w-[30%] overflow-y-auto p-6 space-y-6">
            {/* Applicant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Applicant Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span>
                  </div>
                  <p className="text-sm ml-6">
                    {application.User.Jobseeker?.name || application.User.name || "Not provided"}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                  </div>
                  <p className="text-sm ml-6 break-all">{application.User.email}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Applied:</span>
                  </div>
                  <p className="text-sm ml-6">
                    {new Date(application.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`${statusConfig[application.status].color} border-none text-sm px-3 py-1`}>
                  {statusConfig[application.status].label}
                </Badge>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <form 
                    key={status} 
                    action={async () => {
                      "use server";
                      await updateApplicationStatus(
                        application.id, 
                        status as ApplicationStatus, 
                        application.JobPost.id,
                        application.JobPost.jobTitle,
                        application.User.email as string,
                      );
                    }}
                  >
                    <Button
                      type="submit"
                      variant={application.status === status ? "default" : "outline"}
                      className="w-full justify-start"
                      disabled={application.status === status}
                    >
                      Mark as {config.label}
                    </Button>
                  </form>
                ))}
              </CardContent>
            </Card>

            {/* Resume Download */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <a 
                  href={resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  download
                >
                  <Button variant="outline" className="w-full">
                    Download Resume
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
