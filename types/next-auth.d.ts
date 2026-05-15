import { DefaultSession } from "next-auth";
import { userType } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string | null;
      userType: userType | null;
      onboardingComplete: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image: string | null;
    userType?: userType | null;
    onboardingComplete?: boolean;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    id: string;
    email: string;
    name: string;
    image: string | null;
    userType?: userType | null;
    onboardingComplete?: boolean;
  }
}
