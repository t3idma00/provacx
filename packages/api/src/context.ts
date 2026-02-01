/**
 * tRPC Context
 * Creates the context used by all tRPC procedures
 */

import type { PrismaClient, User, OrganizationRole, PlatformAdmin } from "@provacx/database";
import { prisma } from "@provacx/database";

/**
 * Session type (from NextAuth)
 */
export interface Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
  expires: string;
}

/**
 * Context options passed from the API handler
 */
export interface CreateContextOptions {
  session: Session | null;
  organizationId?: string;
  platformAdmin?: PlatformAdmin | null;
  headers?: Headers;
}

/**
 * Inner context - shared between all procedures
 */
interface InnerContext {
  prisma: PrismaClient;
  session: Session | null;
  user: User | null;
  organizationId: string | null;
  organizationRole: OrganizationRole | null;
  platformAdmin: PlatformAdmin | null;
}

/**
 * Create the inner context
 */
async function createInnerContext(opts: CreateContextOptions): Promise<InnerContext> {
  let user: User | null = null;

  if (opts.session?.user?.id) {
    user = await prisma.user.findUnique({
      where: { id: opts.session.user.id },
    });
  }

  return {
    prisma,
    session: opts.session,
    user,
    organizationId: opts.organizationId ?? null,
    organizationRole: null, // Will be set by organizationProcedure
    platformAdmin: opts.platformAdmin ?? null,
  };
}

/**
 * Create context for API handlers
 */
export async function createContext(opts: CreateContextOptions): Promise<Context> {
  return createInnerContext(opts);
}

/**
 * Context type used by tRPC procedures
 */
export type Context = Awaited<ReturnType<typeof createInnerContext>>;
