import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, setSession } from "@/lib/auth";
import { createUser } from "@/lib/store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const user = await createUser({
      email: body.email.toLowerCase(),
      passwordHash: await hashPassword(body.password),
      plan: "free",
      planStatus: "inactive",
    });
    await setSession(user.id);
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create account." },
      { status: 400 },
    );
  }
}
