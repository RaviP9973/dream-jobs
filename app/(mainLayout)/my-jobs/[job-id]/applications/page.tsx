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

// Status Helper for UI
const statusConfig: Record<ApplicationStatus, { label: string, color: string }> = {
  PENDING: { label: "Pending", color: "bg-slate-500" },
  IN_REVIEW: { label: "In Review", color: "bg-yellow-500 text-black" },
  INTERVIEW: { label: "Interview", color: "bg-blue-500" },
  OFFER: { label: "Offer", color: "bg-green-600" },
  REJECTED: { label: "Rejected", color: "bg-red-600" },
};

export default async function JobApplicationsPage({ 
  params 
}: { 
  params: { 'job-id': string } 
}) {

  const {"job-id": jobId} = await params;
  const job = await prisma.jobPost.findUnique({
    where: { id: jobId},
    include: {
      JobApplication: {
        include: {
          User: {
            include: { Jobseeker: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!job) return notFound();

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header section with Stats */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">{job.jobTitle}</h1>
          <p className="text-muted-foreground">Manage and review your {job.JobApplication.length} applicants</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{job.JobApplication.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">In Interview</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {job.JobApplication.filter(a => a.status === 'INTERVIEW').length}
            </p>
          </CardContent>
        </Card>
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
                          await updateApplicationStatus(app.id, status as ApplicationStatus, job.id);
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