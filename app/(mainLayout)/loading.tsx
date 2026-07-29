export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse py-8">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-64 bg-muted rounded-lg" />
        <div className="h-4 w-96 bg-muted rounded-md" />
      </div>

      {/* Content skeleton */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-48 bg-muted rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded-md w-full" />
            <div className="h-4 bg-muted rounded-md w-5/6" />
            <div className="h-4 bg-muted rounded-md w-4/6" />
          </div>
          <div className="h-32 bg-muted rounded-xl" />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="h-40 bg-muted rounded-xl" />
          <div className="h-28 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}
