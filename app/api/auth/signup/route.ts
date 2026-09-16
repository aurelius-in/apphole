import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, setSession } from "@/lib/auth";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { createUser } from "@/lib/store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    if (rateLimited(`signup:${clientIp(req)}`, 8, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many signups from this network. Try again later." }, { status: 429 });
    }
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Enter a valid email and a password of at least 8 characters." },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Could not create account.";
    const status = /already exists/i.test(message) ? 409 : 400;
    return NextResponse.json({ error: status === 409 ? message : "Could not create account." }, { status });
  }
}
