"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function ResumeModal({ 
  params, 
  searchParams 
}: { 
  params: { applicationId: string },
  searchParams: { url?: string }
}) {
  const router = useRouter();
  const [resumeUrl, setResumeUrl] = useState<string>("");

  useEffect(() => {
    // Get resume URL from search params
    const urlParam = new URLSearchParams(window.location.search).get('url');
    if (urlParam) {
      setResumeUrl(decodeURIComponent(urlParam));
    }
  }, [searchParams]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={() => router.back()}
    >
      <div 
        className="relative bg-background w-full max-w-5xl h-[90vh] rounded-lg shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Resume Preview</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          {resumeUrl ? (
            <iframe
              src={`${resumeUrl}#toolbar=0`}
              className="w-full h-full border-0 scrollbar-hide"
              title="Resume Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading resume...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
