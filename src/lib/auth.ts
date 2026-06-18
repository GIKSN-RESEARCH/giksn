import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import { user, session, account, verification } from '@/db/schema';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: false, // Using magic link + GitHub
  },
  magicLink: {
    enabled: true,
    sendMagicLink: async ({ email, url }: { email: string; token: string; url: string }) => {
      const { sendTransactionalEmail } = await import("@/lib/email");
      const { MagicLinkEmail } = await import("@/emails/magic-link");

      const result = await sendTransactionalEmail({
        to: email,
        subject: "Sign in to GIKSN Research",
        react: MagicLinkEmail({ url }),
      });

      if (!result.sent && process.env.NODE_ENV !== "production") {
        console.log(`[Better Auth] Magic link for ${email}: ${url}`);
      }
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || 'build-dummy',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'build-dummy',
      // Make sure this redirect URI is registered in your GitHub OAuth App:
      // Local:  http://localhost:3000/api/auth/callback/github
      // Prod:   https://giksn.com/api/auth/callback/github  (or your custom domain)
    },
  },
  // Additional fields for role/status
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'contributor',
        input: false, // Set via hook
      },
      status: {
        type: 'string',
        required: true,
        defaultValue: 'active',
        input: false,
      },
    },
  },
  // Auto-promote admins from env allowlist on sign-in
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
          if (adminEmails.includes(user.email)) {
            return {
              data: {
                ...user,
                role: "admin" as const,
                status: "active" as const,
              },
            };
          }
          return {
            data: {
              ...user,
              role: "contributor" as const,
              status: "suspended" as const,
            },
          };
        },
      },
    },
  },
});