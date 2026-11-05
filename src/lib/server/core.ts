/**
 * Runtime-agnostic server core: database client, auth configuration, and the
 * submissions schema.
 *
 * ⚠️ This file is imported from TWO different runtimes, so it has rules:
 *   - Astro (via ./index.ts), bundled by Vite.
 *   - Plain Node, by scripts/db-migrate.ts and scripts/create-admin.ts, which
 *     run under Node 22's built-in TypeScript support.
 * So: no `astro:*` imports, no relative imports, and only erasable TypeScript
 * syntax (no enums, no namespaces). Break any of those and the scripts stop
 * working while the site carries on fine — a confusing way to find out.
 *
 * Environment values are passed IN rather than read here, because Astro reads
 * them through `astro:env` and the scripts read them from `process.env`.
 *
 * See how-to/admin-dashboard.md.
 */
import { createClient, type Client } from '@libsql/client'
import { LibsqlDialect } from '@libsql/kysely-libsql'
import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { admin } from 'better-auth/plugins'

export interface ServerEnv {
  DATABASE_URL?: string | undefined
  DATABASE_AUTH_TOKEN?: string | undefined
  BETTER_AUTH_SECRET?: string | undefined
  BETTER_AUTH_URL?: string | undefined
}

/** Local development database. Gitignored. Never used in production. */
export const LOCAL_DATABASE_URL = 'file:local.db'

export function createDb(env: ServerEnv): Client {
  return createClient({
    url: env.DATABASE_URL || LOCAL_DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN || undefined,
  })
}

/**
 * Better Auth options. Kept separate from `createAuth` because the migration
 * script needs the raw options object (`getMigrations` takes options, not an
 * auth instance).
 */
export function authOptions(env: ServerEnv, db: Client) {
  return {
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: { dialect: new LibsqlDialect({ client: db }), type: 'sqlite' },

    emailAndPassword: {
      enabled: true,
      // ⚠️ No public sign-up. The only ways to create an account are the
      // `npm run admin:create` script and an existing admin on /admin/users.
      // Turn this off and anyone on the internet can register.
      disableSignUp: true,
      minPasswordLength: 12,
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // refresh the expiry at most once a day
    },

    rateLimit: {
      // On by default only in production; forced on so dev behaves the same.
      enabled: true,
      // ⚠️ 'database', not the default 'memory'. On Vercel every serverless
      // instance has its own memory, so an in-memory limit resets whenever a
      // request lands on a fresh instance — credential stuffing barely slows.
      storage: 'database',
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/email': { window: 60, max: 5 },
      },
    },

    advanced: {
      ipAddress: {
        // Vercel sets x-real-ip itself and overwrites any client-sent value.
        // Don't add headers here that a client could spoof.
        ipAddressHeaders: ['x-real-ip'],
      },
    },

    plugins: [admin()],
  } satisfies BetterAuthOptions
}

export function createAuth(env: ServerEnv, db: Client) {
  return betterAuth(authOptions(env, db))
}

export type Auth = ReturnType<typeof createAuth>

/**
 * Form submissions table. Better Auth manages its own tables (user, session,
 * account, verification, rateLimit); this one is ours.
 *
 * Deliberately NOT stored: raw IP addresses. `ipHash` is a salted hash, used
 * only to rate-limit the public endpoint, and can't be reversed to an address.
 */
export const SUBMISSIONS_SCHEMA = `
CREATE TABLE IF NOT EXISTS submission (
  id TEXT PRIMARY KEY NOT NULL,
  form TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  data TEXT NOT NULL DEFAULT '{}',
  ipHash TEXT,
  createdAt INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS submission_createdAt ON submission (createdAt);
CREATE INDEX IF NOT EXISTS submission_ipHash ON submission (ipHash, createdAt);
`

/** Forms whose submissions are kept in the dashboard. See submissions.ts. */
export const STORED_FORMS = ['contact', 'volunteer'] as const
export type StoredForm = (typeof STORED_FORMS)[number]
