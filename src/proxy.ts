import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Protect API routes
      if (req.nextUrl.pathname.startsWith("/api/pings") && req.method !== "GET") {
        return !!token;
      }
      if (req.nextUrl.pathname.startsWith("/api/posts") && req.method !== "GET") {
        return !!token;
      }
      if (req.nextUrl.pathname.startsWith("/api/chat")) {
        return !!token;
      }
      if (req.nextUrl.pathname.startsWith("/api/dashboard")) {
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: [
    "/api/pings/:path*",
    "/api/posts/:path*",
    "/api/chat/:path*",
    "/api/dashboard/:path*",
  ],
};
