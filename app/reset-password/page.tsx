"use client"

import { useState, useEffect } from "react"
import { Lock, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import AuthShell from "@/app/components/auth-shell"
import Link from "next/link"

/** Reset password - sets a new password after the recovery link is verified. */
export default function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const supabase = createClient()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updatePassword(password)
      if (result.error) {
        setError(result.error)
      } else {
        setDone(true)
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Set New Password"
      subtitle={done ? "Password updated successfully" : ready ? "Enter your new password" : "Verifying your reset link..."}
      icon={<Lock className="h-6 w-6 text-molten" />}
    >
      {error && (
        <Alert className="mb-6 bg-red-900/30 border-red-700/50 rounded-none">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {done ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-green-900/30 border border-green-500/40 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-7 w-7 text-green-400" />
          </div>
          <h3 className="text-lg font-heading font-bold text-white mb-2">Password updated!</h3>
          <p className="text-steel text-sm mb-6">
            Your password has been successfully changed.
          </p>
          <Link href="/signin">
            <Button className="bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold">
              Sign in with new password
            </Button>
          </Link>
        </div>
      ) : !ready ? (
        <div className="text-center py-6">
          <div className="animate-spin h-8 w-8 border-2 border-molten border-t-transparent mx-auto mb-4" />
          <p className="text-steel text-sm uppercase tracking-widest">Checking your reset link...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="password" className="text-chrome">New Password <span className="text-molten">*</span></Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/[0.04] border-white/10 text-white rounded-none pr-10 focus:border-molten"
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-white"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-chrome">Confirm Password <span className="text-molten">*</span></Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
              placeholder="Re-enter your password"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-molten hover:bg-molten-ember text-white py-3 rounded-none uppercase tracking-widest font-semibold text-base"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}