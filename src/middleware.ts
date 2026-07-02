export { auth as middleware } from "@/auth";

// Which routes run the auth check. Add the app's protected paths here.
export const config = {
  matcher: ["/profile", "/profile/:path*", "/posts/new", "/posts/new/:path*"],
};