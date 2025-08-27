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
