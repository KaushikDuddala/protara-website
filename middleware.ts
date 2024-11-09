import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/** Refreshes the Supabase session and enforces auth on protected routes. */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Validate the JWT and extend the session cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const publicPaths = [
    "/",
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/catalogue",
    "/cadathon",
    "/contact",
    "/custom-print-request",
    "/cart",
    "/checkout-cancelled",
    "/checkout-success",
    "/api",
  ]

  const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))

  const protectedPaths = ["/account"]
  const isProtectedPath = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/signin"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (process.env.NODE_ENV === "production") {
    const cookies = supabaseResponse.cookies.getAll()
    for (const cookie of cookies) {
      supabaseResponse.cookies.set({
        name: cookie.name,
        value: cookie.value,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
