"use client"

import { useState } from "react"
import { Mail, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import AuthShell from "@/app/components/auth-shell"
import Link from "next/link"

/** Forgot password - sends a password reset link for the given email. */
export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    try {
      const result = await resetPassword(email)
      if (result.error) {
        setError(result.error)
      } else {
        setSent(true)
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your email and we'll send you a reset link"
      icon={<Mail className="h-6 w-6 text-molten" />}
    >
      {error && (
        <Alert className="mb-6 bg-red-900/30 border-red-700/50 rounded-none">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {sent ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-green-900/30 border border-green-500/40 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-7 w-7 text-green-400" />
          </div>
          <h3 className="text-lg font-heading font-bold text-white mb-2">Check your email</h3>
          <p className="text-steel text-sm mb-6">
            If an account exists with <span className="text-molten">{email}</span>, you'll receive a password reset link shortly.
          </p>
          <Link href="/signin" className="text-molten hover:text-molten-ember text-sm uppercase tracking-widest transition-colors duration-150">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-chrome">Email <span className="text-molten">*</span></Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
              placeholder="john@example.com"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-molten hover:bg-molten-ember text-white py-3 rounded-none uppercase tracking-widest font-semibold text-base"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link href="/signin" className="text-steel hover:text-molten text-sm flex items-center justify-center gap-1 transition-colors duration-150">
          <ArrowBackLink />
        </Link>
      </div>
    </AuthShell>
  )
}

function ArrowBackLink() {
  return (
    <span aria-hidden="true">
      <svg className="h-3 w-3 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back to sign in
    </span>
  )
}