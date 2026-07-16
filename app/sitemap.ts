import type { MetadataRoute } from "next";
import { prisma } from "@/app/utils/db";
import { JobPostStatus } from "@prisma/client";

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  // Get all active job posts
  const jobs = await prisma.jobPost.findMany({
    where: {
      status: JobPostStatus.ACTIVE,
    },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const jobUrls = jobs.map((job) => ({
    url: `${baseUrl}/job/${job.id}`,
    lastModified: job.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticRoutes = ["", "/login", "/register"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.5,
  }));

  return [...staticRoutes, ...jobUrls];
}
