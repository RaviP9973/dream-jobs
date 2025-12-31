"use client";

import { useEffect, useState } from "react";
import { markApplicationAsReviewed } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import { toast } from "sonner";

interface ViewResumeProps {
  resumeUrl: string;
  applicationId: string;
  status: string;
}

export function ViewResume({ resumeUrl, applicationId ,status}: ViewResumeProps) {
  const [hasMarkedAsReviewed, setHasMarkedAsReviewed] = useState(false);

  const handleApplicationStatus =() => {
    // Mark as reviewed when component mounts (when employer views the resume)
    if(status !== "PENDING"){
        return ;
    }
    if (!hasMarkedAsReviewed) {
      markApplicationAsReviewed(applicationId, "IN_REVIEW")
        .then(() => {
          setHasMarkedAsReviewed(true);
        })
        .catch((error) => {
          console.error("Failed to mark application as reviewed:", error);
        });
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Resume downloaded successfully");
      handleApplicationStatus();
    } catch (error) {
      toast.error("Failed to download resume");
      console.error("Download error:", error);
    }
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="link"
        size="sm"
        onClick={() => {

            window.open(resumeUrl, "_blank")
            
            handleApplicationStatus();
        }}
      >
        <Eye className="w-4 h-4 mr-1" />
        View
      </Button>
      <Button variant="link" size="sm" onClick={handleDownload}>
        <Download className="w-4 h-4 mr-1" />
        Download
      </Button>
    </div>
  );
}
