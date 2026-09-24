"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Profile } from "@/types/database.types";

const schema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number"),
});

type FormValues = z.infer<typeof schema>;

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    setSaved(false);
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: values.full_name, phone: values.phone })
      .eq("id", profile.id);

    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="full_name" className="text-sm font-medium text-ink">
          Full name
        </label>
        <input
          id="full_name"
          {...register("full_name")}
          className="mt-1.5 w-full rounded-stub border border-line bg-white px-3 py-2 text-sm text-ink focus:border-route focus:outline-none"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-alert">{errors.full_name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="text-sm font-medium text-ink">
          Phone number
        </label>
        <input
          id="phone"
          {...register("phone")}
          placeholder="+91 98765 43210"
          className="mt-1.5 w-full rounded-stub border border-line bg-white px-3 py-2 text-sm text-ink focus:border-route focus:outline-none"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-alert">{errors.phone.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-alert">{error}</p>}
      {saved && <p className="text-sm text-route">Saved.</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
