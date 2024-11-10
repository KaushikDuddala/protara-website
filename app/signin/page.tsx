"use client"

import { Suspense, useState } from "react"
import { LogIn, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import AuthShell from "@/app/components/auth-shell"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

function SignInForm() {
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const redirectTo = searchParams.get("redirect") || "/account"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const result = await signIn(form.email, form.password)
      if (result.error) {
        setError(result.error)
      } else {
        router.push(redirectTo)
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmed = searchParams.get("confirmed") === "true"

  return (
    <div>
      {confirmed && (
        <Alert className="mb-6 bg-green-900/30 border-green-700/50 rounded-none">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-200">Email confirmed! You can now sign in.</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert className="mb-6 bg-red-900/30 border-red-700/50 rounded-none">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="email" className="text-chrome">Email <span className="text-molten">*</span></Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
            placeholder="john@example.com"
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-chrome">Password <span className="text-molten">*</span></Label>
            <Link href="/forgot-password" className="text-sm text-molten hover:text-molten-ember transition-colors duration-150">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              className="bg-white/[0.04] border-white/10 text-white rounded-none pr-10 focus:border-molten"
              placeholder="Enter your password"
              required
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
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-molten hover:bg-molten-ember text-white py-3 rounded-none uppercase tracking-widest font-semibold text-base"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-steel text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-molten hover:text-molten-ember font-medium transition-colors duration-150">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

/** Sign in page - email/password authentication with redirect support. */
export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to your account"
      icon={<LogIn className="h-6 w-6 text-molten" />}
    >
      <Suspense fallback={<div className="text-center text-steel py-10 uppercase tracking-widest text-sm">Loading...</div>}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  )
}