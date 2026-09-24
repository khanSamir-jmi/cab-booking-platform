import { requireUser, getCurrentProfile } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  await requireUser("/login?redirect=/profile");
  const profile = await getCurrentProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-16">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
          Account
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">
          Your profile
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Keep your details up to date so dispatch can reach you.
        </p>
        <div className="mt-8">
          <ProfileForm profile={profile} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
