import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import crypto from "crypto";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database.types";

/**
 * Ensures a valid UUID format for PostgreSQL.
 * If input is already a UUID, returns it. Otherwise, hashes the seed into a deterministic UUID.
 */
export function ensureValidUuid(id?: string | null, email?: string | null): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (id && uuidRegex.test(id)) return id;
  const seed = (email || id || "anonymous").toLowerCase().trim();
  const hash = crypto.createHash("sha256").update(seed).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function getCookieSession() {
  try {
    const raw = cookies().get("app_session_user")?.value;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Server-only. Returns current user object instantly without network delay. */
export async function getCurrentUser() {
  // 1. Check local session cookie first (0 ms, zero network delay)
  const cookieUser = getCookieSession();
  if (cookieUser && cookieUser.email) {
    const validId = ensureValidUuid(cookieUser.id, cookieUser.email);
    return {
      id: validId,
      email: cookieUser.email,
      phone: cookieUser.phone || null,
      user_metadata: { full_name: cookieUser.email.split("@")[0] },
    } as any;
  }

  // 2. Fallback to Supabase Auth if no local cookie session
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return {
        ...user,
        id: ensureValidUuid(user.id, user.email),
      };
    }
  } catch {
    // Ignore Supabase fetch errors silently
  }

  return null;
}

/** Server-only. Returns current user's profile row. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const validId = ensureValidUuid(user.id, user.email);
  const isEmailAdmin =
    user.email?.toLowerCase().includes("admin@") ||
    user.email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

  try {
    const db = createAdminClient();
    const { data: profile } = await db
      .from("profiles")
      .select("*")
      .eq("id", validId)
      .single();

    if (profile) {
      if (isEmailAdmin && profile.role !== "admin") {
        await db.from("profiles").update({ role: "admin" }).eq("id", validId);
        return { ...(profile as Profile), role: "admin" };
      }
      return profile as Profile;
    }
  } catch {
    // DB fallback
  }

  const role = isEmailAdmin ? "admin" : "customer";
  return {
    id: validId,
    full_name: user.email?.split("@")[0] || "User",
    phone: null,
    role,
    created_at: new Date().toISOString(),
  } as Profile;
}

/** Server-only route-guard for authenticated users. */
export async function requireUser(redirectTo = "/login") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectTo);
  }
  return user;
}

/** Server-only route-guard enforcing role = 'admin'. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/admin/dashboard");
  }

  const isEmailAdmin =
    user.email?.toLowerCase().includes("admin@") ||
    user.email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

  const profile = await getCurrentProfile();

  if (!profile || (profile.role !== "admin" && !isEmailAdmin)) {
    redirect("/login?redirect=/admin/dashboard");
  }

  return profile;
}

/** Server-only. Determines smart redirect URL based on user role. */
export async function getSmartRedirectUrl(fallback = "/"): Promise<string> {
  const profile = await getCurrentProfile();
  if (profile && profile.role === "admin") {
    return "/admin/dashboard";
  }
  return fallback;
}
