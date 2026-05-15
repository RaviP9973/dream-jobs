import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-48 mt-1" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>

            <Separator />

            {/* Skills Section */}
            <div className="space-y-4">
              <div>
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-4 w-64 mt-1" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-7 w-32" />
              </div>
            </div>

            <Separator />

            {/* Achievements Section */}
            <div className="space-y-4">
              <div>
                <Skeleton className="h-6 w-52" />
                <Skeleton className="h-4 w-80 mt-1" />
              </div>
              <Skeleton className="h-24 w-full" />
            </div>

            <Separator />

            {/* Education Section */}
            <div className="space-y-4">
              <div>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-56 mt-1" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
