import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import connectToDatabase from "@/lib/db";
import User from "@/models/User";

function sanitizeAvatarUrl(userId: string, avatar?: string | null): string {
  if (!avatar || typeof avatar !== "string") {
    return `/api/users/${userId}/avatar`;
  }
  // STRUCTURAL SAFEGUARD: Never store Base64 Data URLs (data:image/...) or strings > 150 chars in NextAuth JWT!
  // Prevents HTTP 494 REQUEST_HEADER_TOO_LARGE cookie size overflow.
  if (avatar.startsWith("data:") || avatar.length > 150) {
    console.warn(`[NEXTAUTH_JWT_GUARD] Oversized image string (${avatar.length} chars) sanitized to proxy URL for user ${userId}`);
    return `/api/users/${userId}/avatar`;
  }
  return avatar;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password.");
        }

        try {
          await connectToDatabase();
        } catch (dbErr: any) {
          console.error("AUTH_DB_ERROR details:", dbErr?.name, dbErr?.message, dbErr?.code, dbErr?.stack);
          throw new Error("Service temporarily unavailable. Database connection failed.");
        }

        let user;
        try {
          user = await User.findOne({ email: credentials.email });
        } catch (queryErr: any) {
          console.error("AUTH_QUERY_ERROR details:", queryErr?.name, queryErr?.message, queryErr?.code, queryErr?.stack);
          throw new Error("Service temporarily unavailable. Database query failed.");
        }

        if (!user || !user.password) {
          throw new Error("Invalid credentials or user not found.");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials.");
        }

        const userId = user._id.toString();

        return {
          id: userId,
          email: user.email,
          name: user.name,
          role: user.role,
          username: user.username,
          image: sanitizeAvatarUrl(userId, user.avatar),
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.image = sanitizeAvatarUrl(user.id, user.image);
      }

      if (trigger === "update" && session) {
        if (session.name && typeof session.name === "string") {
          token.name = session.name.slice(0, 60);
        }
        if (session.username && typeof session.username === "string") {
          token.username = session.username.slice(0, 30);
        }
        if (session.image !== undefined) {
          token.image = sanitizeAvatarUrl(token.id as string, session.image);
        }
      }

      // Hard safeguard: Sanitize and enforce maximum field lengths for all JWT payload fields
      token.id = String(token.id || "").slice(0, 50);
      token.name = String(token.name || "").slice(0, 60);
      token.email = String(token.email || "").slice(0, 80);
      token.role = String(token.role || "").slice(0, 30);
      token.username = String(token.username || "").slice(0, 30);
      token.image = sanitizeAvatarUrl(token.id as string, token.image as string);

      const tokenPayloadSize = JSON.stringify(token).length;
      console.log(`[NEXTAUTH_JWT_PAYLOAD_SIZE] Token size: ${tokenPayloadSize} bytes (Max target: < 500 bytes).`);

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session.user as any).username = token.username as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};
