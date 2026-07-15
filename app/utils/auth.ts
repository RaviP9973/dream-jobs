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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }

      if (user || trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: {
            name: true,
            email: true,
            image: true,
            userType: true, 
            onboardingComplete: true
          },
        });

        if (dbUser) {
          token.name = dbUser.name !== null ? dbUser.name : token.name;
          token.email = dbUser.email !== null ? dbUser.email : token.email;
          token.picture = dbUser.image !== null ? dbUser.image : token.picture;
          token.userType = dbUser.userType;
          token.onboardingComplete = dbUser.onboardingComplete;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        console.log("session -> user", session.user);
        session.user.id = token.sub;
        session.user.name = (token.name as string) || session.user.name;
        session.user.email = (token.email as string) || session.user.email;
        session.user.image = (token.picture as string) || session.user.image;
        session.user.userType = token.userType as any;
        session.user.onboardingComplete = token.onboardingComplete as any;
      }
      return session;
    },
  },
})