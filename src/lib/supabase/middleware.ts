import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  let user: any = null;

  // 1. Check local session cookie first (0 ms, zero network delay)
  try {
    const rawCookie = request.cookies.get("app_session_user")?.value;
    if (rawCookie) {
      const parsed = JSON.parse(rawCookie);
      if (parsed?.email) {
        user = {
          id: parsed.id || "user-id",
          email: parsed.email,
          user_metadata: { full_name: parsed.email.split("@")[0] },
        };
      }
    }
  } catch {
    // Ignore parse error
  }

  // 2. Fallback check to Supabase Auth if no local cookie session
  if (!user) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              supabaseResponse = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      const { data } = await supabase.auth.getUser();
      if (data?.user) user = data.user;
    } catch {
      // Ignore Supabase fetch errors silently
    }
  }

  const url = request.nextUrl.clone();
  const isAuthPage = url.pathname === "/login" || url.pathname === "/signup";
  const isAdminPage = url.pathname.startsWith("/admin");

  if (user) {
    const isEmailAdmin =
      user.email?.toLowerCase().includes("admin@") ||
      user.email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

    const isAdmin = isEmailAdmin;

    if (isAuthPage) {
      const target = isAdmin ? "/admin/dashboard" : (url.searchParams.get("redirect") || "/");
      url.pathname = target;
      url.searchParams.delete("redirect");
      return NextResponse.redirect(url);
    }

    if (isAdminPage && !isAdmin) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  } else {
    if (isAdminPage) {
      url.pathname = "/login";
      url.searchParams.set("redirect", "/admin/dashboard");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
