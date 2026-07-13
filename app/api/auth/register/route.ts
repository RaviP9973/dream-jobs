import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/db";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/app/utils/mailsender";

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

    // Delete existing token if any
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Create new OTP token valid for 10 minutes
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires,
      },
    });

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
