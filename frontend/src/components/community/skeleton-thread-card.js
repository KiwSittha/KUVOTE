import React from "react";

export default function SkeletonThreadCard() {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4">
      {/* Vote Button Skeleton */}
      <div className="flex flex-col items-center gap-1">
        <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
        <div className="h-4 w-8 animate-pulse rounded bg-gray-200"></div>
        <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
      </div>

      {/* Content Skeleton */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Category and Time */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-5 w-16 animate-pulse rounded-md bg-gray-200"></div>
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
        </div>

        {/* Title */}
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200"></div>

        {/* Content Preview */}
        <div className="space-y-1">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-8 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}