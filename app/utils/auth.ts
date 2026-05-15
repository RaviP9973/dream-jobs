
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  
  providers: [GitHub, Google],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // Fetch user type from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { 
            userType: true, 
            onboardingComplete: true,
            email: true,
            name: true,
            image: true,
          },
        });
        
        // Attach all user details to session
        session.user.id = user.id;
        session.user.email = dbUser?.email || user.email || "";
        session.user.name = dbUser?.name || user.name || "";
        session.user.image = dbUser?.image || user.image || null;
        session.user.userType = dbUser?.userType ?? null;
        session.user.onboardingComplete = dbUser?.onboardingComplete ?? false;
      }
      return session;
    },
  },
})