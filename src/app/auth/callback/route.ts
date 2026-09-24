import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the redirect from Supabase's confirmation emails — used by
// signUp() when "Confirm email" is enabled in the dashboard. The link
// points here with a `code` param; exchanging it creates the session
// cookies and logs the user straight in (no separate login step needed
// after confirming).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect") || "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Missing/invalid/expired code — send them back to try again.
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
