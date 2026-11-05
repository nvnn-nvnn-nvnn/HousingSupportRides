/**
 * Create an admin account from the command line. This is how the FIRST admin
 * gets made — public sign-up is disabled, and /admin/users needs an admin to
 * already exist.
 *
 *   npm run admin:create -- someone@example.com "Their Name"
 *
 * A strong random password is generated and printed once. It is never passed
 * on the command line, so it doesn't end up in your shell history.
 *
 * Why this works without being signed in: Better Auth's admin plugin rejects
 * createUser over HTTP without an admin session, but allows a direct
 * server-side call with no request attached — exactly this script. Verified in
 * better-auth/dist/plugins/admin/routes.mjs:
 *   if (!session && (ctx.request || ctx.headers)) throw ctx.error("UNAUTHORIZED")
 */
import { randomBytes } from 'node:crypto'
import { createAuth, createDb } from '../src/lib/server/core.ts'

const [email, ...nameParts] = process.argv.slice(2)
const name = nameParts.join(' ').trim()

if (!email || !email.includes('@') || !name) {
  console.error('Usage: npm run admin:create -- someone@example.com "Their Name"')
  process.exit(1)
}

// 18 random bytes → 24 base64url characters, ~144 bits. Well past the 12-char minimum.
const password = randomBytes(18).toString('base64url')

const db = createDb(process.env)
const auth = createAuth(process.env, db)

try {
  await auth.api.createUser({ body: { email, password, name, role: 'admin' } })
} catch (error) {
  console.error(`Could not create admin: ${error instanceof Error ? error.message : String(error)}`)
  console.error('Has `npm run db:migrate` been run against this database?')
  process.exit(1)
}

db.close()
console.log(`
Admin created: ${email}

  Temporary password:  ${password}

Shown once — copy it now. Sign in at /admin/login, then change it under
Admins → "Set password". Hand it over in person or by phone, not by email.
`)
