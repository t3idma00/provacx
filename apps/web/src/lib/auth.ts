/**
 * NextAuth Configuration
 */

import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { prisma } from "@provacx/database";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const authDebug =
  process.env.NEXTAUTH_DEBUG === "true" ||
  process.env.AUTH_DEBUG === "true" ||
  process.env.NODE_ENV === "development";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleEnabled = Boolean(googleClientId && googleClientSecret);

if (authDebug && !authSecret) {
  console.warn(
    "Auth secret is missing. Set AUTH_SECRET (recommended) or NEXTAUTH_SECRET."
  );
}

if (authDebug && !googleEnabled) {
  console.warn(
    "Google OAuth is disabled. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it."
  );
}

export const authConfig: NextAuthConfig = {
  // Temporarily disable adapter to test OAuth without database
  // adapter: PrismaAdapter(prisma),
  debug: authDebug,
  trustHost: true,
  secret: authSecret,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/onboarding/organization",
  },
  providers: [
    ...(googleEnabled
      ? [
          Google({
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Log sign-in attempts for debugging
      console.log("SignIn callback:", {
        email: user?.email,
        provider: account?.provider,
        hasProfile: !!profile,
      });
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in - user object is only available on first call
      if (account && user) {
        console.log("JWT callback - initial sign in:", { email: user.email });
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

/**
 * Get session on server side
 */
export async function getSession() {
  return auth();
}

/**
 * Require authentication
 * Throws redirect to login if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
