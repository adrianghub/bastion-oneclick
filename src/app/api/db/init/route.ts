import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const sql = getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS public.agents (
        id SERIAL PRIMARY KEY,
        uuid UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("/api/db/init error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
