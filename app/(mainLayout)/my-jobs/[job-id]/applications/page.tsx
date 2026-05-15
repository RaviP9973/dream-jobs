// import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  MoreHorizontal, 
  Mail, 
  Calendar,
  GraduationCap,
  Award,
  Code,
  Briefcase,
  ExternalLink,
  Github
} from "lucide-react";

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
        orderBy: [
          { matchScore: 'desc' }, // Sort by match score (highest first)
          { createdAt: 'desc' } // Then by application date
        ]
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

  // Calculate average match score
  const averageScore = job.JobApplication.length > 0
    ? Math.round(
        job.JobApplication.reduce((sum, app) => sum + (app.matchScore || 0), 0) / 
        job.JobApplication.length
      )
    : 0;

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header section with Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{job.jobTitle}</h1>
            <p className="text-muted-foreground mt-1">
              {job.JobApplication.length} {job.JobApplication.length === 1 ? "applicant" : "applicants"} found
            </p>
          </div>
          <div className="flex gap-3">
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-2xl font-bold">{job.application}</div>
                <div className="text-xs text-muted-foreground">Total Applications</div>
              </div>
            </Card>
            {job.JobApplication.length > 0 && (
              <Card className="px-4 py-2">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    averageScore >= 75 ? 'text-green-600' : 
                    averageScore >= 50 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {averageScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Match Score</div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <Card className="p-1">
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusConfig).map(([s, config]) => (
            <Link
              key={s}
              href={`/my-jobs/${job.id}/applications?status=${s}`}
            >
              <Button 
                variant={s === status ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                {config.label}
              </Button>
            </Link>
          ))}
        </div>
      </Card>

      {/* Applications Grid */}
      {job.JobApplication.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No Applications Yet</h3>
            <p className="text-sm text-muted-foreground">
              No applications with status "{statusConfig[status].label}" found.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {job.JobApplication.map((app) => (
            <Card key={app.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Section - Candidate Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold">
                          {app.User.Jobseeker?.name || app.User.name || "Unknown"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{app.User.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Applied {new Date(app.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={`${statusConfig[app.status].color} border-none`}>
                          {statusConfig[app.status].label}
                        </Badge>
                        {app.matchScore !== null && app.matchScore !== undefined && (
                          <Badge 
                            className={`border-none ${
                              app.matchScore >= 75 
                                ? 'bg-green-600' 
                                : app.matchScore >= 50 
                                ? 'bg-yellow-600 text-black' 
                                : 'bg-red-600'
                            }`}
                          >
                            Match: {app.matchScore}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {app.User.Jobseeker?.about && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {app.User.Jobseeker.about}
                      </p>
                    )}

                    {/* Skills Section */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Code className="w-4 h-4" />
                        <span>Technical Skills</span>
                      </div>
                      {app.User.Jobseeker?.skills && app.User.Jobseeker.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {app.User.Jobseeker.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs font-normal">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No skills listed</p>
                      )}
                    </div>

                    {/* Education & Achievement Section */}
                    <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
                      {/* Education */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <GraduationCap className="w-4 h-4" />
                          <span>Education</span>
                        </div>
                        {app.User.Jobseeker?.university ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{app.User.Jobseeker.degree}</p>
                            <p className="text-sm text-muted-foreground">{app.User.Jobseeker.university}</p>
                            {app.User.Jobseeker.graduationYear && (
                              <p className="text-xs text-muted-foreground">
                                {app.User.Jobseeker.currentlyStudying ? "Expected " : "Class of "}
                                {app.User.Jobseeker.graduationYear}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No education info</p>
                        )}
                      </div>

                      {/* Achievements */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Award className="w-4 h-4" />
                          <span>Achievements</span>
                        </div>
                        {app.User.Jobseeker?.achievements && app.User.Jobseeker.achievements.length > 0 ? (
                          <div className="space-y-1">
                            {app.User.Jobseeker.achievements.slice(0, 2).map((achievement, idx) => (
                              <p key={idx} className="text-sm text-muted-foreground">
                                • {achievement}
                              </p>
                            ))}
                            {app.User.Jobseeker.achievements.length > 2 && (
                              <p className="text-xs text-muted-foreground italic">
                                +{app.User.Jobseeker.achievements.length - 2} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No achievements listed</p>
                        )}
                      </div>
                    </div>

                    {/* Projects Section */}
                    {app.User.Jobseeker?.projects && Array.isArray(app.User.Jobseeker.projects) && app.User.Jobseeker.projects.length > 0 && (
                      <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Briefcase className="w-4 h-4" />
                          <span>Projects ({app.User.Jobseeker.projects.length})</span>
                        </div>
                        <div className="space-y-3">
                          {(app.User.Jobseeker.projects as any[]).slice(0, 2).map((project: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                              <div>
                                <h5 className="text-sm font-semibold">{project.title}</h5>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {project.description}
                                </p>
                              </div>
                              {project.technologies && project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {project.technologies.slice(0, 4).map((tech: string, techIdx: number) => (
                                    <Badge key={techIdx} variant="outline" className="text-[10px] px-1.5 py-0">
                                      {tech}
                                    </Badge>
                                  ))}
                                  {project.technologies.length > 4 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                      +{project.technologies.length - 4}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              <div className="flex gap-3 text-xs">
                                {project.projectUrl && (
                                  <a
                                    href={project.projectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Demo
                                  </a>
                                )}
                                {project.githubUrl && (
                                  <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                  >
                                    <Github className="h-3 w-3" />
                                    Code
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                          {app.User.Jobseeker.projects.length > 2 && (
                            <p className="text-xs text-muted-foreground italic text-center">
                              +{app.User.Jobseeker.projects.length - 2} more project{app.User.Jobseeker.projects.length - 2 === 1 ? '' : 's'} - view full resume
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex lg:flex-col gap-2 lg:w-48">
                    <Link 
                      href={`/resume/${app.id}?url=${encodeURIComponent(app.resume)}`}
                      scroll={false}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full gap-2">
                        <FileText className="w-4 h-4" />
                        View Resume
                      </Button>
                    </Link>
                    
                    <form action={async (formData: FormData) => {
                      "use server";
                      const newStatus = formData.get("status") as ApplicationStatus;
                      await updateApplicationStatus(app.id, newStatus, job.id, job.jobTitle, app.User.email as string);
                    }}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="default" className="flex-1 lg:w-full gap-2">
                            Update Status
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Change Application Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {Object.entries(statusConfig).map(([s, config]) => (
                            <DropdownMenuItem key={s} asChild>
                              <button 
                                type="submit" 
                                name="status" 
                                value={s}
                                className="w-full cursor-pointer"
                              >
                                <div className={`w-2 h-2 rounded-full ${config.color} mr-2`} />
                                {config.label}
                              </button>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </form>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}