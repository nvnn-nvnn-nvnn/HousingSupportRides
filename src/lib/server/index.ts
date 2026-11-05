/**
 * Astro-side entry point for the database and auth. Server-only — never import
 * this from a component that ships to the browser.
 *
 * ⚠️ Everything here is LAZY, on purpose. Middleware imports this module, and
 * middleware also runs while static pages are prerendered at build time. If the
 * database were opened at import, a missing DATABASE_URL on Vercel would fail
 * the ENTIRE build — taking the public site down over an admin feature. Lazy
 * getters mean an unconfigured database breaks /admin and nothing else.
 */
import {
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  DATABASE_AUTH_TOKEN,
  DATABASE_URL,
} from 'astro:env/server'
import type { Client } from '@libsql/client'
import { createAuth, createDb, type Auth, type ServerEnv } from './core'

const env: ServerEnv = {
  DATABASE_URL,
  DATABASE_AUTH_TOKEN,
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
}

export class ServerNotConfiguredError extends Error {}

/**
 * In production a local SQLite file is not an option — Vercel's filesystem is
 * read-only and wiped between invocations, so writes would fail or vanish.
 * Fail loudly instead of quietly writing to nowhere.
 */
function assertConfigured() {
  if (!import.meta.env.PROD) return
  const missing = (['DATABASE_URL', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL'] as const).filter(
    (key) => !env[key],
  )
  if (missing.length > 0) {
    throw new ServerNotConfiguredError(
      `Admin is not configured: missing ${missing.join(', ')}. ` +
        'Set them in Vercel → Project → Settings → Environment Variables. ' +
        'See how-to/admin-dashboard.md.',
    )
  }
}

let db: Client | undefined
let auth: Auth | undefined

export function getDb(): Client {
  assertConfigured()
  db ??= createDb(env)
  return db
}

export function getAuth(): Auth {
  auth ??= createAuth(env, getDb())
  return auth
}

/** True when the admin backend can run. Used to degrade gracefully. */
export function isServerConfigured(): boolean {
  try {
    assertConfigured()
    return true
  } catch {
    return false
  }
}

export type AuthSessionResult = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>
export type AuthUser = AuthSessionResult['user']
export type AuthSession = AuthSessionResult['session']

/** Same salt as auth, so ipHash can't be precomputed without the secret. */
export function getHashSalt(): string {
  return env.BETTER_AUTH_SECRET || 'dev-only-salt'
}
