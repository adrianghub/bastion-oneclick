import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const sql = getSql();
    // Ensure required extension for UUID generation (used in defaults below)
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

    // NextAuth core tables
    await sql`CREATE TABLE IF NOT EXISTS public.users (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT,
      email TEXT UNIQUE,
      "emailVerified" TIMESTAMPTZ,
      image TEXT
    )`;

    await sql`CREATE TABLE IF NOT EXISTS public.accounts (
      id TEXT DEFAULT gen_random_uuid(),
      "userId" TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      PRIMARY KEY (provider, "providerAccountId"),
      CONSTRAINT accounts_userid_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE
    )`;

    await sql`CREATE TABLE IF NOT EXISTS public.sessions (
      id TEXT DEFAULT gen_random_uuid(),
      "sessionToken" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      expires TIMESTAMPTZ NOT NULL,
      CONSTRAINT sessions_userid_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE
    )`;

    await sql`CREATE TABLE IF NOT EXISTS public.verification_token (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires TIMESTAMPTZ NOT NULL,
      PRIMARY KEY (identifier, token)
    )`;

    // Agents table (linked to users)
    await sql`CREATE TABLE IF NOT EXISTS public.agents (
      id SERIAL PRIMARY KEY,
      uuid UUID NOT NULL,
      user_id TEXT NULL REFERENCES public.users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;

    await sql`CREATE UNIQUE INDEX IF NOT EXISTS agents_uuid_idx ON public.agents (uuid)`;

    // Agent claim tokens table (Phase 3)
    await sql`CREATE TABLE IF NOT EXISTS public.agent_claim_tokens (
      id SERIAL PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;

    await sql`CREATE INDEX IF NOT EXISTS agent_claim_tokens_token_idx ON public.agent_claim_tokens (token)`;
    await sql`CREATE INDEX IF NOT EXISTS agent_claim_tokens_user_id_idx ON public.agent_claim_tokens (user_id)`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("/api/db/init error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
