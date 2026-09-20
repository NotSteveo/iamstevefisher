import { NextResponse } from "next/server";

// TODO: wire this up to a real email/notification service (e.g. Resend, Postmark,
// or a Google Sheet via a webhook) before relying on this in production. Right now
// it just validates the payload and logs it server-side so the form has something
// to submit to.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    typeof body.message !== "string" ||
    !body.name.trim() ||
    !body.email.trim() ||
    !body.message.trim()
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  console.log("Contact form submission:", body);

  return NextResponse.json({ ok: true });
}
