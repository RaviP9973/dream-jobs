// import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  MoreHorizontal, 
  Mail, 
  Calendar 
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateApplicationStatus } from "@/app/actions";
import { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/requireUser";

// Status Helper for UI
const statusConfig: Record<ApplicationStatus, { label: string, color: string }> = {
  PENDING: { label: "Pending", color: "bg-slate-500" },
  IN_REVIEW: { label: "In Review", color: "bg-yellow-500 text-black" },
  INTERVIEW: { label: "Interview", color: "bg-blue-500" },
  OFFER: { label: "Offer", color: "bg-green-600" },
  REJECTED: { label: "Rejected", color: "bg-red-600" },
};

async function getJobWithApplications(jobId: string, status: ApplicationStatus = "PENDING") {
  const job = await prisma.jobPost.findUnique({
    where: { 
      id: jobId,
    },
    include: {
      JobApplication: {
        where: {
          status: status
        },
        include: {
          User: {
            include: { Jobseeker: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  return job;
}

export default async function JobApplicationsPage({ 
  params , searchParams
}: { 
  params: { 'job-id': string } ,
  searchParams: { status?: ApplicationStatus }
}) {

  const session = await requireUser();
  const {"job-id": jobId} = await params;
  const {"status": statusParam} = await searchParams;
  const status = statusParam || "PENDING";
  
  const job = await getJobWithApplications(jobId, status);

  if (!job) return notFound();

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header section with Stats */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold capitalize">{job.jobTitle}</h1>
          <p className="text-muted-foreground">Manage and review your {job.JobApplication.length} {job.JobApplication.length === 1 ? "applicant" : "applicants"}</p>
        </div>
      </div>

      {/* filter for OFFER */}
      <div className="flex items-center gap-4">
        <span className="font-medium">Filter by Status:</span>
        {Object.entries(statusConfig).map(([s, config]) => (
          <Link
            key={s}
            href={`/my-jobs/${job.id}/applications?status=${s}`}
            className={`px-3 py-1 rounded-full text-sm font-medium text-blue-600 ${s === status ? "underline font-bold" : ""}`}
          >
            {config.label}
          </Link>
        ))}
      </div>

      {/* Main Table */}
      <div className="rounded-xl border shadow-sm  overflow-hidden">
        <Table>
          <TableHeader className="">
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Resume</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {job.JobApplication.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {app.User.Jobseeker?.name || app.User.name || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {app.User.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${statusConfig[app.status].color} border-none`}>
                    {statusConfig[app.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {new Date(app.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link 
                    href={`/resume/${app.id}?url=${encodeURIComponent(app.resume)}`}
                    scroll={false}
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="w-4 h-4" /> View Resume
                    </Button>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {Object.keys(statusConfig).map((status) => (
                        <form key={status} action={async () => {
                          "use server";
                          await updateApplicationStatus(app.id, status as ApplicationStatus, job.id, job.jobTitle, app.User.email as string);
                        }}>
                          <DropdownMenuItem>
                            <button type="submit" className="w-full text-left">
                               Mark as {status.replace('_', ' ')}
                            </button>
                          </DropdownMenuItem>
                        </form>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}