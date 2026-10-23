"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function OtpAuthForm() {
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  useEffect(() => {
    let interval: any;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneOrEmail.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code.");

      setInfoNotice(data.message || `Verification code sent to ${phoneOrEmail}.`);
      setStep("otp");
      setResendTimer(30);
      setCanResend(false);
      setOtpValues(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  }

  function handleDigitChange(index: number, value: string) {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otpValues.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneOrEmail,
          otpCode: code,
          authMethod: "otp",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed.");

      window.location.href = data.redirectUrl || redirectUrl;
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneOrEmail.trim() || !password) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneOrEmail,
          password,
          authMethod: "password",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid login credentials.");

      window.location.href = data.redirectUrl || redirectUrl;
    } catch (err: any) {
      setError(err.message || "Invalid login credentials. Click Sign Up to set a password!");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!phoneOrEmail.trim() || !canResend) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend code.");
      setResendTimer(30);
      setCanResend(false);
      setInfoNotice(data.message || `New verification code sent to ${phoneOrEmail}.`);
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-stub border border-line bg-white p-6 shadow-sm space-y-6">
      {/* Auth Mode Toggle Tabs */}
      <div className="flex rounded-stub bg-paper p-1 border border-line/60">
        <button
          type="button"
          onClick={() => {
            setAuthMethod("otp");
            setError(null);
          }}
          className={`flex-1 py-1.5 font-mono text-xs font-bold uppercase rounded-stub transition ${
            authMethod === "otp" ? "bg-route text-paper shadow-sm" : "text-ink/60 hover:text-ink"
          }`}
        >
          📱 OTP Login
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMethod("password");
            setError(null);
          }}
          className={`flex-1 py-1.5 font-mono text-xs font-bold uppercase rounded-stub transition ${
            authMethod === "password" ? "bg-route text-paper shadow-sm" : "text-ink/60 hover:text-ink"
          }`}
        >
          🔑 Password Login
        </button>
      </div>

      {authMethod === "otp" ? (
        step === "identifier" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-3xl">📱</span>
              <h2 className="font-display text-xl font-bold text-ink">Sign in with OTP</h2>
              <p className="text-xs text-ink/60">
                Enter your mobile number or email to receive a 6-digit verification code.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-ink uppercase font-mono">
                Mobile Number / Email
              </label>
              <input
                type="text"
                required
                placeholder="+91 9876543210 or user@example.com"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                className="mt-1 w-full rounded-stub border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:border-route focus:outline-none"
              />
            </div>

            {error && <p className="text-xs text-alert">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending OTP..." : "Get OTP Code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="font-display text-xl font-bold text-ink">Verify 6-Digit OTP</h2>
              <p className="text-xs text-ink/60">
                Sent to <span className="font-semibold text-ink">{phoneOrEmail}</span>
              </p>
            </div>

            {infoNotice && (
              <div className="rounded-stub bg-route/10 border border-route/30 p-2.5 text-[11px] text-route font-medium text-center">
                💡 {infoNotice}
              </div>
            )}

            {/* 6-Digit Code Box Input */}
            <div className="flex justify-between gap-1.5">
              {otpValues.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="h-12 w-11 text-center font-mono text-xl font-bold rounded-stub border border-line bg-paper text-ink focus:border-route focus:ring-2 focus:ring-route/20 focus:outline-none"
                />
              ))}
            </div>

            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-xs font-mono text-route font-bold hover:underline"
                >
                  Resend OTP Code
                </button>
              ) : (
                <p className="text-xs font-mono text-ink/50">
                  Resend OTP in <span className="font-bold text-ink">{resendTimer}s</span>
                </p>
              )}
            </div>

            {error && <p className="text-xs text-alert text-center">{error}</p>}

            <div className="space-y-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Verifying & Logging In..." : "Verify & Continue"}
              </Button>
              <button
                type="button"
                onClick={() => setStep("identifier")}
                className="w-full text-xs text-ink/60 hover:text-ink text-center"
              >
                ← Edit Phone Number / Email
              </button>
            </div>
          </form>
        )
      ) : (
        /* Password Login Form */
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-3xl">🔑</span>
            <h2 className="font-display text-xl font-bold text-ink">Account Login</h2>
            <p className="text-xs text-ink/60">
              Enter your email and account password to log in.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-ink uppercase font-mono">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="mt-1 w-full rounded-stub border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-route focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink uppercase font-mono">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-stub border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-route focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-stub bg-alert/10 border border-alert/30 p-2.5 text-xs text-alert text-center font-medium leading-relaxed">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>
      )}

      {/* Sign up / Login Footer Link */}
      <p className="mt-4 text-center text-xs text-ink/60 border-t border-line/60 pt-4">
        {pathname?.includes("signup") ? (
          <>
            Already have an account?{" "}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
              className="font-bold text-route hover:underline"
            >
              Log in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`}
              className="font-bold text-route hover:underline"
            >
              Sign up
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
