import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/logo.svg";
import { LoginForm } from "@/components/forms/LoginForm";
import { auth } from "@/app/utils/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function Login() {
  const session = await auth();

  if(session?.user){
    return redirect("/");
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center ">
      <div className="flex w-full max-w-sm flex-col gap-6 ">
        <Link href="/" className="flex items-center gap-2 self-center">
          <Image src={Logo} alt="Logo" className="size-10" />
          <h1 className="text-2xl font-bold">Dream<span className="text-primary">Jobs</span></h1>
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
