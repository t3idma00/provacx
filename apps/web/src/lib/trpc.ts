/**
 * tRPC Client Configuration
 */

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "@provacx/api";

/**
 * Create tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get base URL for API calls
 */
function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser should use relative path
    return "";
  }

  // SSR should use Vercel URL or localhost
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Create tRPC client
 */
export function createTRPCClient(headers?: Headers) {
  return trpc.createClient({
    links: [
      // Log in development
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      // Batch requests
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
        headers() {
          const heads = new Map<string, string>();

          if (headers) {
            headers.forEach((value, key) => {
              heads.set(key, value);
            });
          }

          return Object.fromEntries(heads);
        },
      }),
    ],
  });
}
