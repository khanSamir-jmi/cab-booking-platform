"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
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
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm rounded-stub border border-line bg-white p-8 shadow-sm">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
        Sign in
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">
        Log in
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Enter your email and password to continue.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoFocus
            placeholder="you@example.com"
            {...register("email")}
            className="mt-1.5 w-full rounded-stub border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-route focus:outline-none"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-alert">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className="mt-1.5 w-full rounded-stub border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-route focus:outline-none"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-alert">{errors.password.message}</p>
          )}
        </div>

        {error && <p className="text-sm text-alert">{error}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Don&apos;t have an account?{" "}
        <Link
          href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-route hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
