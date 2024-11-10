"use client"

import { useState } from "react"
import { UserPlus, AlertCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import AuthShell from "@/app/components/auth-shell"
import Link from "next/link"
import { useRouter } from "next/navigation"

/** Sign up page - creates a new account and confirms the email address. */
export default function SignUpPage() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await signUp(form.email, form.password, form.name)
      if (result.error) {
        setError(result.error)
      } else {
        router.push("/signin?confirmed=true")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Create Account"
      subtitle="Join Protara Printing today"
      icon={<UserPlus className="h-6 w-6 text-molten" />}
    >
      {error && (
        <Alert className="mb-6 bg-red-900/30 border-red-700/50 rounded-none">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="name" className="text-chrome">Full Name <span className="text-molten">*</span></Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
            placeholder="John Doe"
            required
          />
        </div>
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
          <Label htmlFor="password" className="text-chrome">Password <span className="text-molten">*</span></Label>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
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
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
            placeholder="Repeat password"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-molten hover:bg-molten-ember text-white py-3 rounded-none uppercase tracking-widest font-semibold text-base"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-steel text-sm">
          Already have an account?{" "}
          <Link href="/signin" className="text-molten hover:text-molten-ember font-medium transition-colors duration-150">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}