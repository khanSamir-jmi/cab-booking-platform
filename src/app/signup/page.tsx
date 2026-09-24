import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
