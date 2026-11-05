/**
 * Browser-side Better Auth client, for the /admin pages' scripts.
 * Talks to /api/auth/* on the same origin — no baseURL needed.
 *
 * This holds no secrets and grants nothing by itself: every call it makes is
 * authorized server-side by the session cookie. Calling
 * authClient.admin.createUser() without an admin session just gets a 401.
 */
import { createAuthClient } from 'better-auth/client'
import { adminClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [adminClient()],
})
