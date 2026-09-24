import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore error
  }

  const cookieStore = cookies();
  cookieStore.set("app_session_user", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set("app_session_user", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}

export async function POST(request: Request) {
  return GET(request);
}
