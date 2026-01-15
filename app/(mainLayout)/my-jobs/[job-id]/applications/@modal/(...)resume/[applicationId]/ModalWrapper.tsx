"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

export function ModalWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-7xl">
        {/* Close Button - Positioned absolutely on top right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
        >
          <X className="h-4 w-4" />
        </Button>
        
        {children}
      </div>
    </div>
  );
}
