"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOutAction() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore Supabase signout errors
  }

  const cookieStore = cookies();
  cookieStore.set("app_session_user", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  redirect("/login");
}
