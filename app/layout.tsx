import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import HackathonBanner from "./components/hackathon-banner"
import { Analytics } from "@vercel/analytics/next"
import Navigation from "./components/navigation"
import SmoothScroll from "@/components/smooth-scroll"
import CursorView from "@/components/interactions/cursor-view"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Protara Printing | Custom 3D Printing Services & Products",
  description: "Professional Custom 3D Printing Services and Decorative 3D Printed Products",
}

/** Root layout - global providers, navigation, analytics, and cursor interaction layer. */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png"/>
      </head>
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-body`}>
        <Analytics/>
        <SmoothScroll>
          <AuthProvider>
            <HackathonBanner />
            <CartProvider>
              <Navigation />
              {children}
            </CartProvider>
          </AuthProvider>
        </SmoothScroll>
        <CursorView />
      </body>
    </html>
  )
}
