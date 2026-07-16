import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/db";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/app/utils/mailsender";
import { redis } from "@/app/utils/redis";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    // Store user with unverified email
    if (existingUser) {
      // User exists but not verified, update password and OTP
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword } as any,
      });
    } else {
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        } as any,
      });
    }

    // Rate Limiting: Check if OTP was sent in the last 60 seconds
    const rateLimitKey = `ratelimit:otp:${email}`;
    const otpKey = `otp:${email}`;

    const isRateLimited = await redis.get(rateLimitKey);
    if (isRateLimited) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting another OTP." },
        { status: 429 }
      );
    }

    // Store OTP in Redis valid for 10 minutes (600 seconds)
    await redis.setEx(otpKey, 600, otp);

    // Set rate limit for 60 seconds
    await redis.setEx(rateLimitKey, 60, "true");

    // Send OTP via Nodemailer
    await sendEmail({
      to: email,
      subject: "Your OTP for Dream Jobs Registration",
      html: `<p>Your verification code is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
