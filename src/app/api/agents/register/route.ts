import { getSql, RFC4122_UUID_REGEX } from "@/lib/db";
import { NextResponse } from "next/server";

type RegisterRequestBody = {
  uuid?: string;
  claim_token?: string;
};

export async function POST(request: Request) {
  try {
    const sql = getSql();
    const body = (await request.json()) as RegisterRequestBody;
    const uuid = body?.uuid?.trim();
    const claimToken = body?.claim_token?.trim();

    if (!uuid || !RFC4122_UUID_REGEX.test(uuid)) {
      return NextResponse.json({ error: "Invalid uuid" }, { status: 400 });
    }

    if (!claimToken) {
      return NextResponse.json({ error: "Claim token is required" }, { status: 400 });
    }

    // Validate claim token and get user_id
    const tokenRows = await sql`
      SELECT user_id, expires_at
      FROM public.agent_claim_tokens
      WHERE token = ${claimToken}
    `;

    if (tokenRows.length === 0) {
      return NextResponse.json({ error: "Invalid claim token" }, { status: 400 });
    }

    const tokenData = tokenRows[0];
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (now > expiresAt) {
      return NextResponse.json({ error: "Claim token has expired" }, { status: 400 });
    }

    // Insert agent with user_id from claim token
    await sql`INSERT INTO public.agents (uuid, user_id) VALUES (${uuid}, ${tokenData.user_id})`;

    // Delete the used claim token
    await sql`DELETE FROM public.agent_claim_tokens WHERE token = ${claimToken}`;

    return new NextResponse(null, { status: 201 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const code = error?.code ?? error?.originalError?.code;
    if (code === "23505") {
      return NextResponse.json(
        { error: "Agent already registered" },
        { status: 409 }
      );
    }

    console.error("/api/agents/register error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
