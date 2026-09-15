import { NextResponse } from "next/server";
import { z } from "zod";
import { setSession, verifyPassword } from "@/lib/auth";
import { getUserByEmail } from "@/lib/store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const user = await getUserByEmail(body.email.toLowerCase());
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    await setSession(user.id);
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not log in." },
      { status: 400 },
    );
  }
}
