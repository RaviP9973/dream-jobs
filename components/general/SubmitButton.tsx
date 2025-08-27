"use client";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import React, { ReactNode } from "react";

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
