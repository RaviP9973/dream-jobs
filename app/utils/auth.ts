import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub, 
    Google,
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        }) as any;

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email first");
        }

        return {
          id: user.id,
          name: user.name as string,
          email: user.email as string,
          image: user.image as string,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Fetch user type from database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { 
            userType: true, 
            onboardingComplete: true,
            email: true,
            name: true,
            image: true,
          },
        });
        
        // Attach all user details to session
        session.user.id = token.sub;
        session.user.email = dbUser?.email || session.user.email || "";
        session.user.name = dbUser?.name || session.user.name || "";
        session.user.image = dbUser?.image || session.user.image || null;
        session.user.userType = dbUser?.userType ?? null;
        session.user.onboardingComplete = dbUser?.onboardingComplete ?? false;
      }
      return session;
    },
  },
})