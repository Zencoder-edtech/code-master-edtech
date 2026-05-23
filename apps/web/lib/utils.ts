// =============================================================================
// Utility Functions — Shared Helpers for the Web App
// =============================================================================
// cn() — Class Name Merger
//   Combines clsx (conditional class names) with tailwind-merge (resolves
//   Tailwind class conflicts). This is the standard pattern used by shadcn/ui.
//
//   Example:
//     cn("px-4 py-2", isActive && "bg-blue-500", "px-6")
//     → "py-2 px-6 bg-blue-500"  (px-6 overrides px-4, not duplicated)
// =============================================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
