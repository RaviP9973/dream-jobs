import Link from "next/link";
import Logo from "@/public/logo.svg";
import Image from "next/image";
import { buttonVariants } from "../ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { auth } from "@/app/utils/auth";
import { UserDropdown } from "./UserDropdown";
export async function Navbar() {
  const session = await auth();

  return (
    <nav className="flex items-center justify-between py-1 border-b mb-2 px-8">
      <Link href="/" className="flex items-center justify-between py-2  ">
        <Image src={Logo} alt="Logo" width={40} height={40} />
        <h1 className="text-2xl font-bold ">
          Dream<span className="text-primary">Jobs</span>
        </h1>
      </Link>

      {/* desktop navigation */}
      <div className="hidden md:flex items-center gap-5">
        <ThemeToggle />
        {/* if user's role is COMPANY then  only show this button */}
        {session?.user?.userType === "COMPANY" && (
          <Link href="/post-job" className={buttonVariants({ size: "lg" })}>
            Post Job
          </Link>
        )}

        {session?.user ? (
          <UserDropdown
            email={session.user.email}
            name={session.user.name}
            image={session.user.image || ""}
            userId={session.user.id}
            userType={session?.user?.userType!}
          />
        ) : (
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline" })}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
