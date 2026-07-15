import { ChevronDown, Heart, Layers2, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { signOut } from "@/app/utils/auth";
import { prisma } from "@/app/utils/db";


interface iAppProps {
  email: string,
  name: string,
  image: string,
  userId: string
  userType: 'COMPANY' | 'JOBSEEKER' ;
}


export async function UserDropdown({ email, name, image, userId, userType }: iAppProps) {
  // Get user type to conditionally show profile link
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userType: true }
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar>
            <AvatarImage src={image} alt="Profile image" />
            <AvatarFallback>{name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>

          <ChevronDown size={16} strokeWidth={2} className="ml-1 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="W-48 " align="end">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{name} </span>
          <span className="text-xs text-muted-foreground">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user?.userType === "JOBSEEKER" && (
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full">
                <User size={16} strokeWidth={2} className="opacity-60" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link href="/favorites" className="w-full"><Heart size={16} strokeWidth={2} className="opacity-60" />

              <span>Favorite jobs</span>
            </Link>

          </DropdownMenuItem>


          {
            userType === "COMPANY" && (
              <DropdownMenuItem asChild>
                <Link href="/my-jobs" className="w-full">
                  <Layers2 size={16} strokeWidth={2} className="opacity-60" />

                  <span>My job listings</span>
                </Link>

              </DropdownMenuItem>
            )
          }

        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={async () => {
            "use server"

            await signOut({ redirectTo: "/" });
          }}>
            <button className="w-full flex flex-row items-center gap-2">
              <LogOut size={16} strokeWidth={2} className="opacity-60" />

              <span>Logout</span>
            </button>
          </form>

        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
