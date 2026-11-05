/**
 * Create or update every database table: Better Auth's (user, session, account,
 * verification, rateLimit) plus our submission table.
 *
 *   npm run db:migrate
 *
 * Safe to run repeatedly — it only adds what's missing. Run it once locally,
 * and once against production after setting DATABASE_URL in .env (see
 * how-to/admin-dashboard.md).
 *
 * Runs under Node 22's built-in TypeScript support, so it imports core.ts
 * directly — which is why core.ts may not import anything from `astro:*`.
 */
import { getMigrations } from 'better-auth/db/migration'
import { authOptions, createDb, LOCAL_DATABASE_URL, SUBMISSIONS_SCHEMA } from '../src/lib/server/core.ts'

const env = process.env
const target = env.DATABASE_URL || LOCAL_DATABASE_URL
console.log(`Migrating ${target.startsWith('file:') ? target : target.replace(/\/\/.*@/, '//***@')}`)

const db = createDb(env)

const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(authOptions(env, db))
if (toBeCreated.length === 0 && toBeAdded.length === 0) {
  console.log('Auth tables: already up to date.')
} else {
  console.log(`Auth tables: creating ${toBeCreated.map((t) => t.table).join(', ') || 'none'}; adding columns to ${toBeAdded.map((t) => t.table).join(', ') || 'none'}.`)
  await runMigrations()
}

await db.executeMultiple(SUBMISSIONS_SCHEMA)
console.log('Submission table: ready.')

db.close()
console.log('Done.')
