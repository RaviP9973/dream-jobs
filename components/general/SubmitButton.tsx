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


export function SaveJobButton({savedJob} : {savedJob: boolean}) {
  const { pending } = useFormStatus();
  return (  
    <Button type="submit" variant="outline" disabled={pending} className="flex items-center gap-2">
      {
        pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>{!savedJob ? "Saving..." : "Unsaving..."}</span>
          </>
        ) : (
          <>
            <Heart className={cn(
              savedJob ? 'fill-current text-red-500': 'size-4 transition-colors',
            )} />
            {savedJob ? <span>Saved</span> : <span>Save Job</span>}
          </>
        )
      }
    </Button>
  )
}