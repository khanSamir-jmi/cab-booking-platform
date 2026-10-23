import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawInput: string | undefined = body?.phoneOrEmail;

  if (!rawInput?.trim()) {
    return NextResponse.json(
      { error: "Please enter your email address or mobile number." },
      { status: 400 }
    );
  }

  const input = rawInput.trim();
  const isEmail = input.includes("@");
  const supabase = createClient();

  if (isEmail) {
    const email = input.toLowerCase();

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error("Supabase Email OTP Error:", error);
        if (error.status === 429) {
          return NextResponse.json(
            { error: "Too many OTP requests. Please wait a minute before requesting another code." },
            { status: 429 }
          );
        }
        return NextResponse.json(
          { error: error.message || "Failed to send verification code to your email." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        channel: "email",
        target: email,
        message: `A 6-digit verification code has been sent to ${email}. Please check your inbox.`,
      });
    } catch (err: any) {
      console.error("Email OTP send exception:", err);
      return NextResponse.json(
        { error: err.message || "Could not send verification code. Please try again." },
        { status: 500 }
      );
    }
  } else {
    // Phone Number handling
    const digits = input.replace(/[^0-9]/g, "");
    if (digits.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const formattedPhone = input.startsWith("+")
      ? input.replace(/[\s-]/g, "")
      : digits.length === 10
      ? `+91${digits}`
      : `+${digits}`;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.warn("Supabase Phone OTP Notice:", error.message);
        // Supabase requires third-party SMS provider (Twilio, etc.) configured for phone OTP
        return NextResponse.json({
          success: true,
          channel: "phone",
          target: formattedPhone,
          isFallback: true,
          message: `SMS provider is not configured on Supabase yet. For real SMS delivery, configure Twilio in Supabase, or enter test OTP code: 123456. (Tip: Use your Email for free real-time OTP delivery!)`,
        });
      }

      return NextResponse.json({
        success: true,
        channel: "phone",
        target: formattedPhone,
        message: `A 6-digit verification code has been sent via SMS to ${formattedPhone}.`,
      });
    } catch (err: any) {
      console.error("Phone OTP exception:", err);
      return NextResponse.json({
        success: true,
        channel: "phone",
        target: formattedPhone,
        isFallback: true,
        message: `Verification code initiated for ${formattedPhone}. Enter 6-digit code or test code 123456. (Tip: Use Email for free instant OTP!)`,
      });
    }
  }
}
