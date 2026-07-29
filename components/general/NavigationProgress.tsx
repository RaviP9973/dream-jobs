"use client";

import { useEffect, useState, useTransition } from "react";

// Monkey-patch Next.js router to detect navigation
function useNavigationProgress() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Intercept click events on links
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        target.getAttribute("target") === "_blank"
      ) {
        return;
      }

      // Check if it's navigating to a different page
      if (href !== window.location.pathname) {
        setIsNavigating(true);
        setProgress(0);
      }
    };

    // Listen for route change completion
    const observer = new MutationObserver(() => {
      if (isNavigating) {
        setIsNavigating(false);
        setProgress(100);
      }
    });

    document.addEventListener("click", handleClick, true);
    observer.observe(document.querySelector("head")!, {
      childList: true,
      subtree: true,
    });

    return () => {
      document.removeEventListener("click", handleClick, true);
      observer.disconnect();
    };
  }, [isNavigating]);

  // Animate progress while navigating
  useEffect(() => {
    if (!isNavigating) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        // Slow down as we approach 90%
        const increment = Math.max(1, (90 - prev) * 0.1);
        return Math.min(prev + increment, 90);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isNavigating]);

  // Reset after completion
  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  return { isNavigating, progress };
}

export function NavigationProgress() {
  const { isNavigating, progress } = useNavigationProgress();

  if (progress === 0 && !isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress >= 100 ? 0 : 1,
          boxShadow: "0 0 10px var(--primary), 0 0 5px var(--primary)",
        }}
      />
    </div>
  );
}
