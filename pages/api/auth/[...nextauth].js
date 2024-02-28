import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prismaClient";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  theme: {
    colorScheme: "auto",
    brandColor: "#FFFFFF",
    logo: "/favicon.ico",
    buttonText: "#000000",
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.user.id;

      return session;
    },
    async jwt({ token, account, user }) {
      if (user) {
        if (!token.user) {
          token.user = {
            id: "",
          };
        }

        token.user.id = user.id;
      }
      return token;
    },
  },
});
