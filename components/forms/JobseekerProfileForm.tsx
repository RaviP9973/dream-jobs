"use client";

import { updateJobseekerProfile } from "@/app/actions";
import { jobseekerProfileSchema, projectSchema } from "@/app/utils/zodSchemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { Jobseeker } from "@prisma/client";
import { PlusCircle, X, ExternalLink, Github } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobseekerProfileFormProps {
  jobseeker: Jobseeker;
}

export function JobseekerProfileForm({ jobseeker }: JobseekerProfileFormProps) {
  const [pending, setPending] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [currentProject, setCurrentProject] = useState<z.infer<typeof projectSchema>>({
    title: "",
    description: "",
    technologies: [],
    projectUrl: "",
    githubUrl: "",
  });
  const [currentTechnology, setCurrentTechnology] = useState("");

  const form = useForm<z.infer<typeof jobseekerProfileSchema>>({
    resolver: zodResolver(jobseekerProfileSchema),
    defaultValues: {
      name: jobseeker.name || "",
      about: jobseeker.about || "",
      skills: jobseeker.skills || [],
      achievements: jobseeker.achievements || [],
      projects: (jobseeker.projects as z.infer<typeof projectSchema>[]) || [],
      university: jobseeker.university || "",
      degree: jobseeker.degree || "",
      fieldOfStudy: jobseeker.fieldOfStudy || "",
      graduationYear: jobseeker.graduationYear ?? undefined,
      currentlyStudying: jobseeker.currentlyStudying ?? false,
    },
  });

  const skills = form.watch("skills");
  const achievements = form.watch("achievements");
  const projects = form.watch("projects");

  useEffect(() => {
    console.log("JobseekerProfileForm - Initial jobseeker data:", {
      projects: jobseeker.projects,
      projectsType: typeof jobseeker.projects,
      projectsIsArray: Array.isArray(jobseeker.projects),
      projectsLength: Array.isArray(jobseeker.projects) ? jobseeker.projects.length : 0
    });
  }, [jobseeker.projects]);

  async function onSubmit(data: z.infer<typeof jobseekerProfileSchema>) {
    try {
      setPending(true);
      console.log("Submitting profile data:", {
        ...data,
        projects: data.projects,
        projectsCount: data.projects.length
      });
      const result = await updateJobseekerProfile(data);
      if (result?.success) {
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      console.error("Error details:", error?.message || error);
      
      // Show more specific error message
      if (error?.message?.includes("validation")) {
        toast.error("Validation error: " + error.message);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
      setPending(false);
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      form.setValue("skills", [...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    form.setValue(
      "skills",
      skills.filter((skill) => skill !== skillToRemove)
    );
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      form.setValue("achievements", [...achievements, newAchievement.trim()]);
      setNewAchievement("");
    }
  };

  const removeAchievement = (achievementToRemove: string) => {
    form.setValue(
      "achievements",
      achievements.filter((achievement) => achievement !== achievementToRemove)
    );
  };

  const addTechnologyToProject = () => {
    if (currentTechnology.trim() && !currentProject.technologies.includes(currentTechnology.trim())) {
      setCurrentProject({
        ...currentProject,
        technologies: [...currentProject.technologies, currentTechnology.trim()],
      });
      setCurrentTechnology("");
    }
  };

  const removeTechnologyFromProject = (tech: string) => {
    setCurrentProject({
      ...currentProject,
      technologies: currentProject.technologies.filter((t) => t !== tech),
    });
  };

  const saveProject = () => {
    if (currentProject.title.trim() && currentProject.description.trim()) {
      const updatedProjects = [...projects, currentProject];
      console.log("Saving project:", currentProject);
      console.log("Updated projects array:", updatedProjects);
      form.setValue("projects", updatedProjects);
      setCurrentProject({
        title: "",
        description: "",
        technologies: [],
        projectUrl: "",
        githubUrl: "",
      });
      setIsAddingProject(false);
      toast.success("Project added!");
    } else {
      toast.error("Please fill in project title and description");
    }
  };

  const removeProject = (index: number) => {
    form.setValue(
      "projects",
      projects.filter((_, i) => i !== index)
    );
    toast.success("Project removed");
  };

  const cancelAddProject = () => {
    setCurrentProject({
      title: "",
      description: "",
      technologies: [],
      projectUrl: "",
      githubUrl: "",
    });
    setIsAddingProject(false);
  };

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.error("Form validation errors:", errors);
        toast.error("Please fix the validation errors in the form");
      })}>
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <p className="text-sm text-muted-foreground">
              Update your basic profile details
            </p>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself, your experience, and what you're looking for..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A brief description of your professional background
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Skills Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Programming Skills</h3>
            <p className="text-sm text-muted-foreground">
              Add your technical skills and programming languages
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., JavaScript, Python, React, SQL..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addSkill}
                variant="outline"
                size="icon"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Achievements Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Achievements & Details</h3>
            <p className="text-sm text-muted-foreground">
              Add your personal achievements, certifications, or notable accomplishments
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                placeholder="e.g., Won first place in hackathon, Published research paper, Open source contributor..."
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addAchievement();
                  }
                }}
                className="min-h-[60px]"
              />
              <Button
                type="button"
                onClick={addAchievement}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>

            {achievements.length > 0 && (
              <div className="space-y-2">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 rounded-lg border bg-card"
                  >
                    <p className="text-sm flex-1">{achievement}</p>
                    <button
                      type="button"
                      onClick={() => removeAchievement(achievement)}
                      className="ml-2 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Projects</h3>
              <p className="text-sm text-muted-foreground">
                Showcase your personal or professional projects
              </p>
            </div>
            {!isAddingProject && (
              <Button
                type="button"
                onClick={() => setIsAddingProject(true)}
                variant="outline"
                size="sm"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            )}
          </div>

          {isAddingProject && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">New Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Project Title</label>
                  <Input
                    placeholder="e.g., E-commerce Platform"
                    value={currentProject.title}
                    onChange={(e) =>
                      setCurrentProject({ ...currentProject, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe what the project does, your role, and the impact..."
                    value={currentProject.description}
                    onChange={(e) =>
                      setCurrentProject({ ...currentProject, description: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Technologies Used</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="e.g., React, Node.js, PostgreSQL..."
                      value={currentTechnology}
                      onChange={(e) => setCurrentTechnology(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTechnologyToProject();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addTechnologyToProject}
                      variant="outline"
                      size="icon"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  {currentProject.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentProject.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-sm">
                          {tech}
                          <button
                            type="button"
                            onClick={() => removeTechnologyFromProject(tech)}
                            className="ml-2 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Project URL (Optional)
                    </label>
                    <Input
                      placeholder="https://your-project.com"
                      value={currentProject.projectUrl}
                      onChange={(e) =>
                        setCurrentProject({ ...currentProject, projectUrl: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub URL (Optional)
                    </label>
                    <Input
                      placeholder="https://github.com/username/repo"
                      value={currentProject.githubUrl}
                      onChange={(e) =>
                        setCurrentProject({ ...currentProject, githubUrl: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelAddProject}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={saveProject}
                  >
                    Save Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {projects.length > 0 && (
            <div className="space-y-3">
              {projects.map((project, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-semibold text-lg">{project.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.description}
                          </p>
                        </div>

                        {project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-4">
                          {project.projectUrl && (
                            <a
                              href={project.projectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Live Demo
                            </a>
                          )}
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <Github className="h-3 w-3" />
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProject(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Education Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Education</h3>
            <p className="text-sm text-muted-foreground">
              Add your educational background
            </p>
          </div>

          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel>University / College</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Massachusetts Institute of Technology"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Bachelor of Science"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fieldOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field of Study</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Computer Science"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="graduationYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Graduation Year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 2026"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentlyStudying"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Currently studying</FormLabel>
                    <FormDescription>
                      Check if you are currently enrolled
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              console.log("Current form state:", {
                projects: form.getValues("projects"),
                allValues: form.getValues(),
                formState: form.formState,
                errors: form.formState.errors
              });
            }}
          >
            Debug Form State
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
