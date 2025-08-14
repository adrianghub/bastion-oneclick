import { getSession } from "@/auth";
import { getSql } from "@/lib/db";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

function generateClaimToken(): string {
  // Generate a cryptographically secure token in format BASTION-XXX-XXX
  const randomPart1 = randomBytes(3).toString("hex").toUpperCase();
  const randomPart2 = randomBytes(3).toString("hex").toUpperCase();
  return `BASTION-${randomPart1}-${randomPart2}`;
}

export async function POST() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getSql();
  const token = generateClaimToken();

  // Token expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  try {
    await sql`
      INSERT INTO public.agent_claim_tokens (token, user_id, expires_at)
      VALUES (${token}, ${session.user.id}, ${expiresAt})
    `;

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("/api/agents/claim-tokens error", error);
    return NextResponse.json(
      { error: "Failed to generate claim token" },
      { status: 500 }
    );
  }
}
