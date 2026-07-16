import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/onboarding/",
        "/payment/",
        "/my-jobs/",
        "/profile/",
        "/favorites/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
