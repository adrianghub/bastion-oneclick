import NeonAdapter from "@auth/neon-adapter";
import { Pool } from "@neondatabase/serverless";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const authOptions: NextAuthOptions = {
  adapter: NeonAdapter(pool),
  session: { strategy: "database" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  debug: process.env.NODE_ENV !== "production",
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        // Expose the database user id in the session for server routes
        // Types are augmented in src/types/next-auth.d.ts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = user.id as string;
      }
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}
