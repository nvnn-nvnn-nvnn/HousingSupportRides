/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Set by src/middleware.ts on /admin and /keystatic requests; null elsewhere. */
    user: import('./lib/server').AuthUser | null
    session: import('./lib/server').AuthSession | null
  }
}
