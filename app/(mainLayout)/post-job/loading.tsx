import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPostJobPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
      <div className="col-span-2 space-y-6">
        <Card className="p-6">
          <Skeleton className="h-8 w-1/4 mb-6" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="h-10 w-full mt-6" />
          </div>
        </Card>
      </div>

      <div className="col-span-1">
        <Card>
          <div className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-6" />

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-lg" />
              ))}
            </div>

            <div className="space-y-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border-l-2 border-primary/20 pl-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-lg p-4 bg-muted/50">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
