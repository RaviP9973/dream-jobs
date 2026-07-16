import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/general/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL!),
  title: {
    default: "Dream Jobs — Find Your Dream Career",
    template: "%s | Dream Jobs",
  },
  description:
    "Discover thousands of job opportunities, build AI-powered resumes, and prepare for interviews. Your dream career starts here.",
  keywords: [
    "jobs", "job portal", "careers", "job search", "remote jobs",
    "hiring", "employment", "resume builder", "interview prep",
  ],
  openGraph: {
    type: "website",
    siteName: "Dream Jobs",
    title: "Dream Jobs — Find Your Dream Career",
    description: "Discover thousands of job opportunities, build AI-powered resumes, and prepare for interviews.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dream Jobs — Find Your Dream Career",
    description: "Discover thousands of job opportunities, build AI-powered resumes, and prepare for interviews.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/logo.svg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster closeButton richColors/>
        </ThemeProvider>
      </body>
    </html>
  );
}
