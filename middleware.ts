import { authMiddleware } from '@clerk/nextjs';
export default authMiddleware({
  publicRoutes: ['/api/uploadthing'],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};

// export const config = {
//   matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
// };
