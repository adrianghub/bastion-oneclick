import { getSql, RFC4122_UUID_REGEX } from "@/lib/db";
import { NextResponse } from "next/server";

type RegisterRequestBody = {
  uuid?: string;
};

export async function POST(request: Request) {
  try {
    const sql = getSql();
    const body = (await request.json()) as RegisterRequestBody;
    const uuid = body?.uuid?.trim();

    if (!uuid || !RFC4122_UUID_REGEX.test(uuid)) {
      return NextResponse.json({ error: "Invalid uuid" }, { status: 400 });
    }

    await sql`INSERT INTO public.agents (uuid) VALUES (${uuid})`;

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
