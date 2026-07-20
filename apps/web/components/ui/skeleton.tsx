// =============================================================================
// Skeleton Component — Loading Placeholder (shadcn/ui pattern)
// =============================================================================
// Renders an animated pulse placeholder used while content is loading.
// Applied as a loading fallback for dynamically imported components
// (e.g., Monaco Editor, CodeMirror) and during data fetching.
//
// Usage: <Skeleton className="h-[300px] w-full rounded-xl" />
// =============================================================================

import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  )
}

export { Skeleton }
