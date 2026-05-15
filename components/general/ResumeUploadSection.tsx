"use client";

import { useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/components/general/UploadThingReexported";
import { updateJobseekerResume, applyToJob } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { applicationSchema } from "@/app/utils/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ResumeUploadSectionProps {
  currentResume: string | null;
  jobseekerName: string;
  userEmail: string;
  jobId: string;
}

export function ResumeUploadSection({
  currentResume,
  jobseekerName,
  userEmail,
  jobId,
}: ResumeUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      jobPostId: jobId,
      resume: currentResume ?? "",
    },
  });

  const handleUploadComplete = async (res: any) => {
    try {
      if (res && res[0]?.url) {
        const newResumeUrl = res[0].url;
        await updateJobseekerResume(newResumeUrl, currentResume || undefined);
        form.setValue("resume", newResumeUrl);
        toast.success("Resume updated successfully!");
        setShowUploader(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to update resume");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(data: z.infer<typeof applicationSchema>) {
    try {
      await applyToJob(data);
      toast.success("Application submitted successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 border-t pt-4">
        <FormField
          control={form.control}
          name="jobPostId"
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">Your Details</p>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm font-medium">{jobseekerName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="resume"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Your Resume</FormLabel>
              <FormControl>
                <div className="w-full overflow-hidden">
                  {field.value && !showUploader ? (
                    <div className="space-y-2 w-full overflow-hidden">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border w-full overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium cursor-pointer hover:underline block truncate"
                            title={field.value.split("/").pop()}
                            onClick={() => window.open(field.value, "_blank")}
                          >
                            {field.value.split("/").pop()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Current resume
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        type="button"
                        onClick={() => setShowUploader(true)}
                      >
                        <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                        Change Resume
                      </Button>
                    </div>
                  ) : showUploader ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 z-10"
                          onClick={() => setShowUploader(false)}
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <UploadDropzone
                          endpoint="resumeUploader"
                          onClientUploadComplete={handleUploadComplete}
                          onUploadError={(error: Error) => {
                            toast.error(`Upload failed: ${error.message}`);
                            setIsUploading(false);
                          }}
                          onUploadBegin={() => {
                            setIsUploading(true);
                          }}
                          className="ut-button:bg-primary ut-button:ut-readying:bg-primary/50 ut-label:text-primary ut-allowed-content:text-muted-foreground"
                        />
                      </div>
                    </div>
                  ) : (
                    <UploadDropzone
                      endpoint="resumeUploader"
                      onClientUploadComplete={handleUploadComplete}
                      onUploadError={(error: Error) => {
                        toast.error(`Upload failed: ${error.message}`);
                        setIsUploading(false);
                      }}
                      onUploadBegin={() => {
                        setIsUploading(true);
                      }}
                      className="ut-button:bg-primary ut-button:ut-readying:bg-primary/50 ut-label:text-primary ut-allowed-content:text-muted-foreground"
                    />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || !form.watch("resume")}
        >
          {form.formState.isSubmitting ? "Submitting..." : "Apply now"}
        </Button>
      </form>
    </Form>
  );
}
