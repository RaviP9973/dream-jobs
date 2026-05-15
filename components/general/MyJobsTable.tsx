"use client";

import { CopyLinkMenuItem } from "@/components/general/copyLink";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { MyJobListing, MyJobsPageResult } from "@/app/(mainLayout)/my-jobs/types";
import { MoreHorizontal, PenBoxIcon, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type MyJobsTableProps = {
  initialJobs: MyJobListing[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
};

export function MyJobsTable({
  initialJobs,
  initialNextCursor,
  initialHasMore,
}: MyJobsTableProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isFetchingRef.current || !nextCursor) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/my-jobs?cursor=${encodeURIComponent(nextCursor)}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load more jobs");
      }

      const data = (await response.json()) as MyJobsPageResult;
      setJobs((currentJobs) => [...currentJobs, ...data.jobs]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (loadError) {
      console.error(loadError);
      setError("Unable to load more jobs right now.");
    } finally {
      isFetchingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasMore, nextCursor]);

  useEffect(() => {
    if (!hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      {
        rootMargin: "200px 0px",
        threshold: 0.1,
      },
    );

    const targets = rowRefs.current.slice(-2).filter(Boolean);
    targets.forEach((target) => observer.observe(target as Element));

    return () => observer.disconnect();
  }, [hasMore, jobs.length, loadMore]);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created at</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((listing, index) => {
            const isSentinelRow = index >= jobs.length - 2;

            return (
              <TableRow
                key={listing.id}
                ref={(element) => {
                  rowRefs.current[index] = element;
                }}
                className={cn(isSentinelRow && "scroll-mb-6")}
              >
                <TableCell>
                  {listing.company.logo ? (
                    <Image
                      src={listing.company.logo}
                      alt={`${listing.company.name} logo`}
                      width={40}
                      height={40}
                      className="rounded-md size-10"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-md bg-muted text-xs font-semibold uppercase text-muted-foreground">
                      {listing.company.name.slice(0, 2)}
                    </div>
                  )}
                </TableCell>
                <TableCell>{listing.company.name}</TableCell>
                <TableCell>{listing.jobTitle}</TableCell>
                <TableCell>
                  {listing.status.charAt(0).toUpperCase() +
                    listing.status.slice(1).toLowerCase()}
                </TableCell>
                <TableCell>
                  {new Date(listing.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/my-jobs/${listing.id}/applications`}>
                          <PenBoxIcon />
                          <span>See applications</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/my-jobs/${listing.id}/edit`}>
                          <PenBoxIcon />
                          <span>Edit job</span>
                        </Link>
                      </DropdownMenuItem>
                      <CopyLinkMenuItem
                        jobUrl={`${process.env.NEXT_PUBLIC_URL}/job/${listing.id}`}
                      />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/my-jobs/${listing.id}/delete`}>
                          <XCircle />
                          <span>Delete job</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
          {isLoadingMore ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-6 text-center text-sm text-muted-foreground"
              >
                Loading more jobs...
              </TableCell>
            </TableRow>
          ) : null}
          {error ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-6 text-center text-sm text-destructive"
              >
                {error}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      {!hasMore ? (
        <p className="text-center text-sm text-muted-foreground">
          You&apos;ve reached the end of your job posts.
        </p>
      ) : null}
    </div>
  );
}