"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResumePage({ 
  params 
}: { 
  params: { applicationId: string } 
}) {
  const searchParams = useSearchParams();
  const [resumeUrl, setResumeUrl] = useState<string>("");

  useEffect(() => {
    const url = searchParams.get('url');
    if (url) {
      setResumeUrl(decodeURIComponent(url));
    }
  }, [searchParams]);

  return (
    <div className="h-screen w-full">
      {resumeUrl ? (
        <iframe
          src={`${resumeUrl}#toolbar=0`}
          className="w-full h-full border-0"
          title="Resume"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading resume...</p>
        </div>
      )}
    </div>
  );
}
