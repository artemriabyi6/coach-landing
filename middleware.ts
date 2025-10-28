import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Додаткова логіка middleware якщо потрібно
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Захищаємо тільки адмін-маршрути
        if (req.nextUrl.pathname.startsWith('/admin') || 
            req.nextUrl.pathname.startsWith('/analytics')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/analytics/:path*']
}