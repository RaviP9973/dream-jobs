"use client";

import { Link2 } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { toast } from "sonner";

export function CopyLinkMenuItem( {jobUrl} : {jobUrl: string} ) {

    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(jobUrl);
            toast.success("URL Copied to clipboard");
        } catch (error) {
            console.log(error);
            toast.error("Failed to copy URL");
        }
    }
  return (
    <DropdownMenuItem onSelect={handleCopyLink}>
      <Link2 className="size-4" />

      <span>Copy job URL</span>
    </DropdownMenuItem>
  );
}
