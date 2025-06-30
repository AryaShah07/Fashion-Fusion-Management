import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: ["/", "/sign-in"],
  afterAuth(auth, req, evt) {
    const url = new URL(req.url);
    if (!auth.userId && !auth.isPublicRoute) {
      return Response.redirect(new URL('/sign-in', req.url));
    }
    if (auth.userId && url.pathname === "/") {
      return Response.redirect(new URL("/dashboard", req.url));
    }
  }
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};