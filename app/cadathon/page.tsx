"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navigation from "../components/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, Zap, UserPlus, LogIn, Megaphone, CheckCircle, AlertCircle } from "lucide-react"

interface Settings {
  start_date?: string
  end_date?: string
  prize_pool?: string
  registration_open?: boolean
}

interface Announcement {
  id: number
  title: string
  content: string
  created_at: string
}

const EMPTY_SIGNUP = { phone: "", age: "", city: "", location_state: "", country: "" }

/** Cadathon page - call for entry with countdown, signup form and announcements. */
export default function CadathonPage() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const [settings, setSettings] = useState<Settings>({})
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [signup, setSignup] = useState(EMPTY_SIGNUP)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    fetch("/api/cadathon/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {})

    fetch("/api/cadathon/announcements")
      .then((r) => r.json())
      .then((data) => setAnnouncements(data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!settings.start_date) return

    const end = settings.end_date ? new Date(settings.end_date) : new Date(settings.start_date)
    const tick = () => {
      const diff = end.getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [settings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignup((s) => ({ ...s, [e.target.name]: e.target.value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      const response = await fetch("/api/cadathon/signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to register")
      setFeedback({ type: "success", text: "You're in! Watch your email for Cadathon updates." })
      setSignup(EMPTY_SIGNUP)
    } catch (err) {
      setFeedback({ type: "error", text: err instanceof Error ? err.message : "Failed to register" })
    } finally {
      setSubmitting(false)
    }
  }

  const units = [
    { label: "Days", value: timeLeft?.days },
    { label: "Hours", value: timeLeft?.hours },
    { label: "Minutes", value: timeLeft?.minutes },
    { label: "Seconds", value: timeLeft?.seconds },
  ]

  return (
    <div className="min-h-screen bg-void text-white">
      <Navigation />

      <main className="pt-40 pb-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-molten/80 mb-6">
              <Zap className="h-3.5 w-3.5" />
              2025 Protara Cadathon
            </p>
            <h1 className="text-5xl md:text-6xl font-heading leading-[0.95] tracking-[-0.04em] mb-6">
              DESIGN IT.
              <br />
              <span className="text-molten">PRINT IT.</span>
            </h1>
            <p className="text-steel max-w-xl mx-auto mb-10">
              Show the build - win the print. Enter the Cadathon with your best prototype and take home the prize pool.
            </p>

            {timeLeft && (
              <div className="flex justify-center gap-3 md:gap-4 mb-10">
                {units.map((u) => (
                  <div key={u.label} className="bg-obsidian border border-white/[0.06] rounded-2xl px-5 md:px-8 py-4 min-w-[72px]">
                    <p className="text-3xl md:text-4xl font-heading tracking-[-0.03em] tabular-nums">
                      {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-steel mt-1">{u.label}</p>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-steel inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 text-molten" />
              {settings.start_date
                ? `Submissions close ${new Date(settings.start_date).toLocaleDateString()}`
                : "Submissions open now"}
              {settings.prize_pool && <span className="text-molten">· {settings.prize_pool}</span>}
            </p>
          </div>

          <section className="bg-obsidian border border-white/[0.06] rounded-2xl p-8 md:p-10 mb-16">
            <h2 className="text-xl font-heading tracking-[-0.02em] mb-6">Enter the Cadathon</h2>

            {!authLoading && !user ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <LogIn className="h-8 w-8 text-steel" />
                <p className="text-steel">Sign in to register for this year's Cadathon.</p>
                <Button asChild>
                  <Link href="/signin?redirect=/cadathon">Sign in to join</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-steel text-sm">Phone</Label>
                  <Input id="phone" name="phone" value={signup.phone} onChange={handleChange} className="bg-void" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-steel text-sm">Age</Label>
                  <Input id="age" name="age" value={signup.age} onChange={handleChange} className="bg-void" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-steel text-sm">City</Label>
                  <Input id="city" name="city" value={signup.city} onChange={handleChange} className="bg-void" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_state" className="text-steel text-sm">State</Label>
                  <Input id="location_state" name="location_state" value={signup.location_state} onChange={handleChange} className="bg-void" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="country" className="text-steel text-sm">Country</Label>
                  <Input id="country" name="country" value={signup.country} onChange={handleChange} placeholder="United States" className="bg-void" />
                </div>

                {feedback && (
                  <Alert variant={feedback.type === "error" ? "destructive" : "default"} className="md:col-span-2">
                    {feedback.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    <AlertTitle className="sr-only">{feedback.type === "error" ? "Error" : "Success"}</AlertTitle>
                    <AlertDescription>{feedback.text}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={submitting} className="md:col-span-2">
                  <UserPlus className="h-4 w-4" />
                  {submitting ? "Registering..." : "Register for the Cadathon"}
                </Button>
              </form>
            )}
          </section>

          {announcements.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-heading tracking-[-0.02em] mb-6 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-molten" />
                Announcements
              </h2>
              {announcements.map((a) => (
                <div key={a.id} className="bg-obsidian border border-white/[0.06] rounded-2xl p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="font-medium">{a.title}</h3>
                    <span className="text-xs text-steel">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-steel text-sm leading-relaxed">{a.content}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}