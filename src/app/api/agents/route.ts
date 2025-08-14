import { getSession } from "@/auth";
import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sql = getSql();
  const rows = await sql`
    SELECT uuid, created_at
    FROM public.agents
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
  `;
  return NextResponse.json(rows, { status: 200 });
}
