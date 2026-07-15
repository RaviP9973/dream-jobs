"use client";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { Heart, Loader2 } from "lucide-react";
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GeneralSubmitButtonProps {
  text: string;
  variant?:
    | "outline"
    | "destructive"
    | "default"
    | "link"
    | "secondary"
    | "ghost"
    | null
    | undefined;

  width?: string;
  icon?: ReactNode;
}

export default function GeneralSubmitButton({
  text,
  variant = "default",
  width,
  icon,
}: GeneralSubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button variant={variant} className={width} disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Submitting...</span>
        </>
      ) : (
        <>
          {icon && <div>{icon}</div>}
          <span>{text}</span>
        </>
      )}
    </Button>
  );
}


import { useOptimistic } from "react";
import { saveJobPost, unsaveJobPost } from "@/app/actions";

export function SaveJobButton({
  savedJob,
  jobId,
  savedJobId,
}: {
  savedJob: boolean;
  jobId: string;
  savedJobId?: string;
}) {
  const [optimisticSaved, addOptimistic] = useOptimistic(
    savedJob,
    (state, _newVal) => !state
  );

  return (
    <form
      action={async () => {
        addOptimistic(!savedJob);
        if (savedJob && savedJobId) {
          await unsaveJobPost(savedJobId);
        } else {
          await saveJobPost(jobId);
        }
      }}
    >
      <Button type="submit" variant="outline" className="flex items-center gap-2">
        <Heart
          className={cn(
            optimisticSaved ? "fill-current text-red-500" : "size-4 transition-colors"
          )}
        />
        {optimisticSaved ? <span>Saved</span> : <span>Save Job</span>}
      </Button>
    </form>
  );
}