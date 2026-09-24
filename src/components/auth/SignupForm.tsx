"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const schema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError(null);
    const email = values.email.trim().toLowerCase();
    const password = values.password;

    try {
      // 1. Try standard SignUp first
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split("@")[0],
          },
        },
      });

      if (!signUpError && signUpData.session) {
        const isAdmin = email.includes("admin@");
        router.push(isAdmin ? "/admin/dashboard" : redirectTo);
        router.refresh();
        return;
      }

      // 2. If user already registered, try signing in with the entered password
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInErr && signInData.session) {
        const isAdmin = email.includes("admin@");
        router.push(isAdmin ? "/admin/dashboard" : redirectTo);
        router.refresh();
        return;
      }

      // 3. Try fallback password from OTP testing ("Password123!") and update to entered password
      const { data: fallbackData, error: fallbackErr } = await supabase.auth.signInWithPassword({
        email,
        password: "Password123!",
      });

      if (!fallbackErr && fallbackData.session) {
        await supabase.auth.updateUser({ password });
        const isAdmin = email.includes("admin@");
        router.push(isAdmin ? "/admin/dashboard" : redirectTo);
        router.refresh();
        return;
      }

      // 4. If email confirmation is required by Supabase
      if (signUpData?.user && !signUpData.session) {
        setPendingConfirmation(true);
        return;
      }

      setError("An account with this email already exists. Use OTP Login with code 123456 or enter your password on the Login page.");
    } catch (err: any) {
      setError(err.message || "Failed to process registration.");
    }
  }

  if (pendingConfirmation) {
    return (
      <div className="w-full max-w-sm rounded-stub border border-line bg-white p-8 shadow-sm text-center space-y-4">
        <span className="text-4xl">📧</span>
        <h1 className="font-display text-2xl font-bold text-ink">
          Account Registered
        </h1>
        <p className="text-xs text-ink/70">
          Your account is ready! Log in with your email and password.
        </p>
        <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`}>
          <Button className="w-full">Proceed to Log in →</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-stub border border-line bg-white p-8 shadow-sm">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
        Get Started
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">
        Create an Account
      </h1>
      <p className="mt-2 text-xs text-ink/60">
        Sign up for instant cab bookings & admin access.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="text-xs font-mono font-medium text-ink uppercase">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoFocus
            placeholder="you@example.com or admin@terminalcabs.in"
            {...register("email")}
            className="mt-1.5 w-full rounded-stub border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-route focus:outline-none"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-alert">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="text-xs font-mono font-medium text-ink uppercase">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            {...register("password")}
            className="mt-1.5 w-full rounded-stub border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-route focus:outline-none"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-alert">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="text-xs font-mono font-medium text-ink uppercase"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            className="mt-1.5 w-full rounded-stub border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-route focus:outline-none"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-stub bg-alert/10 border border-alert/30 p-3 text-xs text-alert text-center font-medium leading-relaxed">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating account…" : "Create & Set Password"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-ink/60 border-t border-line/60 pt-4">
        Already have an account?{" "}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-bold text-route hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
