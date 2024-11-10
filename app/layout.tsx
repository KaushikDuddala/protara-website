import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

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
  description: "Custom 3D printing services and decorative 3D printed products made in Dallas.",
}

/** Root layout - global providers and fonts. */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-body`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}