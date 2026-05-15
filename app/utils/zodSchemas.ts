import { z } from "zod";
export const companySchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters long"),

  location: z
    .string()
    .min(1, "Location must be defined"),
  about: z
    .string()
    .min(10, "Please provide some information about your company"),
  logo: z
    .string()
    .min(10, "Please provide a logo URL"),

  website: z
    .string()
    .url("Please provide a valid website URL"),
  xAccount: z
    .string()
    .optional(),
});

export const jobseekerSchema = z.object({
  name: z.string().min(2, "name must be at least 2 characters long"),
  about: z.string().min(10, "Please provide some information about yourself"),
  resume: z.string().min(1, "Please provide a resume"),
})

export const projectSchema = z.object({
  title: z.string().min(2, "Project title must be at least 2 characters long"),
  description: z.string().min(10, "Please provide a project description"),
  technologies: z.array(z.string()),
  projectUrl: z.string().optional().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, {
    message: "Please provide a valid URL"
  }),
  githubUrl: z.string().optional().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, {
    message: "Please provide a valid GitHub URL"
  }),
});

export const jobseekerProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  about: z.string().min(10, "Please provide some information about yourself"),
  skills: z.array(z.string()),
  achievements: z.array(z.string()),
  projects: z.array(projectSchema),
  university: z.string().optional(),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  graduationYear: z.number().optional(),
  currentlyStudying: z.boolean(),
})

const jobSchemaBase = z.object({
  jobTitle: z.string().min(2, "Job title must be at least 2 characters long"),

  employmentType: z.string().min(1, "Employment type must be at least 1 character long"),

  location: z.string().min(2, "Location must be at least 2 characters long"),

  salaryFrom: z.number().min(0, "Salary from must be a positive number"),

  salaryTo: z.number().min(1, "Salary to must be a positive number"),

  jobDescription: z.string().min(10, "Job description must be at least 10 characters long"),

  listingDuration: z.number().min(1, "Listing duration must be at least 1 day"),
  benefits: z.array(z.string().min(2, "Benefit must be at least 2 characters long")),

  companyName: z.string().min(1,"Company name is required"),

  companyLocation: z.string().min(1,"Company location is required"),
  

  companyLogo: z.string().min(1,"Please provide a logo URL"),

  companyWebsite: z.string().min(1,"Company website is required"),

  companyXAccount: z.string().optional(),

  companyDescription: z.string().min(1, "Company description is required"),
});

export const jobFormSchema = jobSchemaBase;

export const jobSchema = jobSchemaBase.extend({
  status: z.enum(["DRAFT", "ACTIVE", "EXPIRED"]).default("ACTIVE"),
})

export const applicationSchema = z.object({
    resume : z.string().min(1, "Resume URL is required"),
    jobPostId : z.string().min(1, "Job Post ID is required"),
})