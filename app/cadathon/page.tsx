"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Lightbulb, Users, Trophy, Zap, Calendar, MapPin, Rocket, FileText, BookOpen, UserPlus, CheckCircle, AlertCircle, ArrowLeft, LogIn, Megaphone, ExternalLink } from "lucide-react"
import CadathonParticipantMap from "../components/cadathon-participant-map"
import Navigation from "../components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CadathonSettings {
  banner_enabled: boolean
  start_date: string | null
  end_date: string | null
  prize_pool: string
  discord_link: string
  registration_open: boolean
  minimum_signups: number
  model_link_1: string
  model_link_2: string
  model_link_3: string
  game_description: string
}

interface Announcement {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

interface StateCount {
  state: string
  count: number
}

const AnimatedNumber = ({ value }: { value: number }) => {
  return <div>{String(value).padStart(2, "0")}</div>
}

const card = "bg-obsidian border border-white/[0.06] hover:border-white/15"
const ruleCard = "bg-obsidian border border-resonance/15 hover:border-resonance/30"
const productCard = "bg-obsidian border border-white/[0.06] hover:border-molten/40 hover:-translate-y-1 hover:shadow-[0_0_40px_-12px_rgba(255,69,0,0.35)]"
const inputCls = "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-steel/60"

/** Cadathon landing page - countdown, registration, rules, and announcements. */
export default function CadathonPage() {
  const { user, profile } = useAuth()
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [settings, setSettings] = useState<CadathonSettings | null>(null)
  const [phase, setPhase] = useState<"before" | "during" | "after">("before")

  const [stateDistribution, setStateDistribution] = useState<StateCount[]>([])
  const [totalParticipants, setTotalParticipants] = useState(0)
  const [participantsLoading, setParticipantsLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [checkingRegistration, setCheckingRegistration] = useState(true)

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/cadathon/announcements")
      .then(r => r.ok ? r.json() : [])
      .then(data => setAnnouncements(data))
      .catch(() => null)
      .finally(() => setAnnouncementsLoading(false))
  }, [])

  useEffect(() => {
    if (!user) {
      setCheckingRegistration(false)
      return
    }
    fetch(`/api/cadathon/signups?userId=${user.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.registered) setAlreadyRegistered(true)
      })
      .catch(() => null)
      .finally(() => setCheckingRegistration(false))
  }, [user])

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    city: "",
    location_state: "",
    country: "United States",
  })

  useEffect(() => {
    if (profile && !initialized) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        email: user?.email || "",
        age: profile.age?.toString() || "",
        city: profile.city || "",
        location_state: profile.location_state || "",
        country: profile.country || "United States",
      })
      setInitialized(true)
    }
  }, [profile, user, initialized])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [formSuccess, setFormSuccess] = useState("")
  const [formError, setFormError] = useState("")

  useEffect(() => {
    fetch("/api/cadathon/settings")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setSettings(data))
      .catch(() => null)
  }, [])

  useEffect(() => {
    fetch("/api/cadathon/signups?groupBy=state")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          setStateDistribution(data.stateDistribution || [])
          setTotalParticipants(data.total || 0)
        }
      })
      .catch(() => null)
      .finally(() => setParticipantsLoading(false))
  }, [])

  useEffect(() => {
    if (!settings?.start_date || !settings?.end_date) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const startTime = new Date(settings.start_date!).getTime()
      const endTime = new Date(settings.end_date!).getTime()

      let targetDate: number
      if (now < startTime) {
        setPhase("before")
        targetDate = startTime
      } else if (now < endTime) {
        setPhase("during")
        targetDate = endTime
      } else {
        setPhase("after")
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const difference = targetDate - now
      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateCountdown()
    setIsLoaded(true)

    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [settings])

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError("")
    setFormSuccess("")

    try {
      const res = await fetch("/api/cadathon/signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign up")
      }

      setFormSuccess("You're registered for the Cadathon! Check your email for details.")
      setAlreadyRegistered(true)
      setFormData({ name: "", phone: "", email: "", age: "", city: "", location_state: "", country: "United States" })

      fetch("/api/cadathon/signups?groupBy=state")
        .then((r) => r.ok ? r.json() : null)
        .then((d) => {
          if (d) {
            setStateDistribution(d.stateDistribution || [])
            setTotalParticipants(d.total || 0)
          }
        })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to sign up")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setFormError("Geolocation is not supported by your browser")
      return
    }

    setDetectingLocation(true)
    setFormError("")

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const { latitude, longitude } = position.coords
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        { headers: { "Accept-Language": "en-US" } }
      )
      const data = await res.json()
      const addr = data.address || {}
      const state = addr["ISO3166-2-lvl4"]?.split("-")[1] || addr.state || ""

      setFormData(prev => ({
        ...prev,
        city: addr.city || addr.town || addr.village || addr.hamlet || "",
        location_state: state,
        country: addr.country || "United States",
      }))
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        setFormError("Location access denied. Please enable location services or enter your location manually.")
      } else {
        setFormError("Failed to get current location")
      }
    } finally {
      setDetectingLocation(false)
    }
  }

  const countdownLabel = phase === "before" ? "Starts in" : phase === "during" ? "Ends in" : "Event Concluded"
  const showCountdown = phase !== "after"

  const features = [
    {
      icon: Lightbulb,
      title: "Innovative Ideas",
      description: "Bring your creative solutions to life with cutting-edge technology and design.",
    },
    {
      icon: Users,
      title: "Network & Collaborate",
      description: "Meet talented developers, designers, and innovators from the community.",
    },
    {
      icon: Trophy,
      title: "Win Prizes",
      description: "Compete for exciting prizes and recognition for outstanding projects.",
    },
    {
      icon: Zap,
      title: "Learn & Grow",
      description: "Gain new skills and experience working on real-world problems.",
    },
  ]

  return (
    <div className="min-h-screen bg-void text-white overflow-x-hidden relative pt-24">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,69,0,0.08) 0%, transparent 55%)", height: "560px", width: "100%" }} />
      <div className="relative pb-12">
        <div className="container mx-auto px-4">
          <div className="min-h-[calc(100vh-10rem)] flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-8"
            >
              <div className="flex justify-center mb-6">
                <img
                  src="/REACH_Banner.png"
                  alt="Cadathon REACH Banner"
                  className="w-full max-w-md h-auto object-contain"
                />
              </div>
              <p className="text-sm uppercase tracking-[0.25em] text-molten mb-4">Global CAD Competition</p>
              <p className="text-lg md:text-xl text-steel mb-2">
                A global CAD competition - any software, all skill levels
              </p>
              <p className="text-lg md:text-xl font-heading font-bold text-molten">
                {settings?.prize_pool || "$250 Prize Pool"}
              </p>

              <div className="mt-4 min-h-[44px] flex justify-center">
                {participantsLoading ? (
                  <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-5 py-2">
                    <div className="h-5 w-5 bg-white/[0.06] animate-pulse" />
                    <div className="h-4 w-40 bg-white/[0.06] animate-pulse" />
                  </div>
                ) : totalParticipants > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="inline-flex items-center gap-2 bg-molten/[0.06] border border-molten/20 px-5 py-2">
                      <Users className="h-5 w-5 text-molten" />
                      <span className="text-steel">
                        <strong className="text-molten">{Math.max(settings?.minimum_signups || 0, totalParticipants)}</strong> participant{totalParticipants !== 1 ? "s" : ""} registered
                      </span>
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </motion.div>

            <div className="mb-4 min-h-[80px] flex justify-center">
              {!isLoaded ? (
                <div className="flex items-center justify-center gap-2 md:gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2 md:gap-4">
                      <div className="bg-white/[0.03] border border-white/[0.06] px-3 py-2 md:px-5 md:py-3 min-w-[60px] md:min-w-[80px]">
                        <div className="h-7 md:h-10 w-9 md:w-12 bg-white/[0.06] animate-pulse mx-auto" />
                        <div className="h-3 w-7 md:w-9 bg-white/[0.06] animate-pulse mx-auto mt-2" />
                      </div>
                      {i < 4 && <span className="text-xl md:text-3xl font-bold text-white/[0.15]">:</span>}
                    </div>
                  ))}
                </div>
              ) : showCountdown ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <p className="text-base md:text-lg text-molten mb-1 font-semibold text-center uppercase tracking-[0.25em] text-sm md:text-base">{countdownLabel}</p>
                  <div className="flex items-center justify-center gap-2 md:gap-4">
                    {[
                      { value: countdown.days, label: "Days" },
                      { value: countdown.hours, label: "Hours" },
                      { value: countdown.minutes, label: "Min" },
                      { value: countdown.seconds, label: "Sec" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 md:gap-4">
                        <div className="bg-white/[0.03] border border-white/[0.08] px-3 py-2 md:px-5 md:py-3 min-w-[60px] md:min-w-[80px]">
                          <div className="text-2xl md:text-4xl font-heading font-bold text-molten">
                            <AnimatedNumber value={item.value} />
                          </div>
                          <div className="text-xs md:text-sm uppercase tracking-widest text-steel mt-1">{item.label}</div>
                        </div>
                        {i < 3 && <span className="text-xl md:text-3xl font-bold text-molten/40">:</span>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </div>

            {phase === "after" && isLoaded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-6 bg-molten/10 border border-molten/30 text-center max-w-lg mx-auto"
              >
                <p className="text-2xl font-heading font-bold text-molten">Event Has Concluded</p>
                <p className="text-steel mt-2">Thank you to all participants! Results will be announced soon.</p>
              </motion.div>
            )}

            <div className="flex flex-col md:flex-row gap-4 text-steel justify-center mb-6 text-sm uppercase tracking-widest">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Calendar className="h-5 w-5 text-molten" />
                <span>
                  {settings?.start_date
                    ? `${new Date(settings.start_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} - ${new Date(settings.end_date || settings.start_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                    : "Monthly competitions"}
                </span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <MapPin className="h-5 w-5 text-molten" />
                <span>Online - Any CAD Software</span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="mb-4"
            >
              <div className="max-w-4xl mx-auto">
                <CadathonParticipantMap />
              </div>
            </motion.div>

          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mb-20"
          >
            <div className="max-w-2xl mx-auto">
              <div className="bg-obsidian border border-white/[0.06] p-8">
                <p className="text-sm uppercase tracking-[0.25em] text-molten text-center mb-2">Registration</p>
                <h2 className="text-3xl font-heading font-bold uppercase tracking-[-0.04em] mb-2 text-center">Sign Up for the Cadathon</h2>
                <p className="text-steel text-center mb-8">
                  Register to compete in the ultimate CAD design competition
                </p>

                {formSuccess && (
                  <div className="mb-6 bg-green-900/30 border border-green-700/50 p-4 text-green-200 flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="text-sm">{formSuccess}</span>
                  </div>
                )}

                {formError && (
                  <Alert className="mb-6 bg-red-900/20 border-red-500/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                {user ? (
                  settings === null || checkingRegistration ? (
                    <div className="text-center py-6">
                      <p className="text-steel">Loading registration...</p>
                    </div>
                  ) : alreadyRegistered ? (
                    <div className="text-center py-6">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <p className="text-green-200 text-lg mb-2">You're already registered for the Cadathon!</p>
                      <p className="text-steel">We'll send all updates to your email.</p>
                    </div>
                  ) : settings.registration_open ? (
                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                      <div className="p-4 bg-white/[0.03] border border-white/[0.08] mb-4 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-molten mt-0.5 shrink-0" />
                        <p className="text-steel text-sm">
                          Signed in as <span className="text-molten font-medium">{profile?.name || user.email}</span>
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone" className="text-steel">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                            className={inputCls}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      <div>
                        <Label htmlFor="age" className="text-steel">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          min="1"
                          max="120"
                          value={formData.age}
                          onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                          className={inputCls}
                          placeholder="25"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-steel">City <span className="text-steel/60">(optional)</span></Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className={inputCls}
                          placeholder="e.g. Los Angeles"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location_state" className="text-steel">State <span className="text-steel/60">(optional)</span></Label>
                        <Input
                          id="location_state"
                          value={formData.location_state}
                          onChange={(e) => setFormData(prev => ({ ...prev, location_state: e.target.value }))}
                          className={inputCls}
                          placeholder="e.g. California"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor="country" className="text-steel">Country <span className="text-steel/60">(optional)</span></Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          className={inputCls}
                          placeholder="United States"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={detectingLocation}
                        variant="outline"
                        className="bg-white/[0.03] border border-white/[0.08] text-steel hover:bg-white/[0.06] shrink-0 mb-0"
                        title="Use current location"
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-molten hover:bg-molten-ember text-white py-3 text-lg rounded-none uppercase tracking-widest font-semibold"
                      >
                        <UserPlus className="h-5 w-5 mr-2" />
                        {isSubmitting ? "Registering..." : "Sign Up Now"}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-steel text-lg mb-2">Registration is currently closed</p>
                      <p className="text-steel/60">Check back later for the next challenge</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-6">
                    <LogIn className="h-12 w-12 text-molten mx-auto mb-4" />
                    <p className="text-white text-lg mb-2">Sign in to register</p>
                    <p className="text-steel mb-4">You need an account to join the Cadathon</p>
                    <Link href="/signin?redirect=/cadathon">
                      <Button className="bg-molten hover:bg-molten-ember text-white px-8 py-3 text-lg rounded-none uppercase tracking-widest font-semibold">
                        Sign In
                      </Button>
                    </Link>
                    <div className="mt-3">
                      <Link href="/signup?redirect=/cadathon" className="text-molten hover:text-molten/80 text-sm uppercase tracking-widest">
                        Don't have an account? Sign up
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="container mx-auto px-4 mb-20">
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                <p className="text-sm uppercase tracking-[0.25em] text-molten text-center mb-2">The Rules</p>
                <h2 className="text-3xl md:text-4xl font-heading font-bold uppercase tracking-[-0.04em] mb-8 text-center">Rules & Guidelines</h2>
                <div className="space-y-4">
                  <div className={`${ruleCard} p-6`}>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-molten" />
                      Any CAD Software Welcome
                    </h3>
                    <p className="text-steel">
                      Use whatever CAD tool you're comfortable with - Onshape, Fusion 360, SolidWorks, FreeCAD, Blender, or any other. All software is allowed.
                    </p>
                  </div>
                  <div className={`${ruleCard} p-6`}>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-molten" />
                      Edit History Required
                    </h3>
                    <p className="text-steel">
                      Your design must show edit or version history to verify your work. Designs without proper history may be disqualified.
                    </p>
                  </div>
                  <div className={`${ruleCard} p-6`}>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-molten" />
                      2-Week Competition Window
                    </h3>
                    <p className="text-steel">
                      The competition runs for 2 weeks each round. All submissions must be completed within this window. The challenge is revealed at the start.
                    </p>
                  </div>
                  <a
                    href="/cadathon_guidelines.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block bg-obsidian border-2 border-molten/40 hover:border-molten transition-colors p-6 group`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-8 w-8 text-molten shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-molten group-hover:text-white transition-colors">
                          Full Rules & Guidelines PDF
                        </h3>
                        <p className="text-steel text-sm mt-1">
                          Download the complete rules, judging rubric, and submission guidelines
                        </p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-molten shrink-0 ml-auto" />
                    </div>
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              >
                <p className="text-sm uppercase tracking-[0.25em] text-molten text-center mb-2">Support</p>
                <h2 className="text-3xl md:text-4xl font-heading font-bold uppercase tracking-[-0.04em] mb-8 text-center">Resources & Guides</h2>
                <div className="space-y-4">
                  <motion.div>
                    <div className={`${ruleCard} p-6`}>
                      <BookOpen className="h-8 w-8 text-molten mb-3" />
                      <h3 className="text-lg font-semibold mb-2">CAD Tutorials</h3>
                      <p className="text-steel mb-4">
                        Learn fundamentals and advanced techniques with official guides and video tutorials for your chosen CAD software.
                      </p>
                      <Link href="https://www.youtube.com/watch?v=pMWnsHpDlQE&list=PLxmrkna-ixrIQmsPR3MITi4Ru1bnMH4-l" target="_blank">
                        <Button className="w-full bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold transition-colors">
                          View Guides
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                  <div>
                    <div className={`${ruleCard} p-6`}>
                      <BookOpen className="h-8 w-8 text-molten mb-3" />
                      <h3 className="text-lg font-semibold mb-2">Design Community</h3>
                      <p className="text-steel mb-4">
                        Connect with fellow designers, ask questions, and share your work with the global CAD community.
                      </p>
                      <Link href="https://forum.onshape.com/" target="_blank">
                        <Button className="w-full bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold transition-colors">
                          Visit Forum
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="container mx-auto px-4 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <p className="text-sm uppercase tracking-[0.25em] text-molten text-center mb-2">Updates</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold uppercase tracking-[-0.04em] mb-8 text-center flex items-center justify-center gap-3">
                <Megaphone className="h-7 w-7 text-molten" />
                Announcements
              </h2>
              {announcementsLoading ? (
                <div className="max-w-3xl mx-auto space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className={`${card} p-6`}>
                      <div className="h-5 w-48 bg-white/[0.06] animate-pulse mb-3" />
                      <div className="h-4 w-full bg-white/[0.06] animate-pulse mb-2" />
                      <div className="h-4 w-3/4 bg-white/[0.06] animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : announcements.length > 0 ? (
                <div className="max-w-3xl mx-auto space-y-4">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className={`${card} p-6`}
                    >
                      {a.title && (
                        <h3 className="text-xl font-semibold text-molten mb-2">{a.title}</h3>
                      )}
                      <p className="text-chrome text-base whitespace-pre-wrap">{a.content}</p>
                      <p className="text-steel/60 text-xs uppercase tracking-widest mt-3">
                        {new Date(a.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </motion.div>
          </div>

          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="mb-20"
            >
              <p className="text-sm uppercase tracking-[0.25em] text-molten text-center mb-2">The Challenge</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold uppercase tracking-[-0.04em] mb-12 text-center">Base Models & Challenge</h2>
              {phase === "before" ? (
                <div className="relative h-80 flex items-center justify-center bg-obsidian border border-molten/20">
                  <div className="relative z-10 text-center px-4">
                    <h3 className="text-4xl md:text-5xl font-heading font-bold text-molten mb-4">Coming Soon</h3>
                    <p className="text-steel text-lg max-w-md mb-2">
                      Base models and challenge details will be revealed when the competition starts.
                    </p>
                    {isLoaded && (
                      <p className="text-molten/60 text-sm uppercase tracking-widest">
                        Starts in {countdown.days}d {countdown.hours}h {countdown.minutes}m
                      </p>
                    )}
                  </div>
                </div>
              ) : phase === "after" ? (
                <div className="relative h-80 flex items-center justify-center bg-obsidian border border-molten/20">
                  <div className="relative z-10 text-center px-4">
                    <h3 className="text-4xl md:text-5xl font-heading font-bold text-molten mb-4">Event Concluded</h3>
                    <p className="text-steel text-lg max-w-md mb-8">
                      This Cadathon round has concluded. Thank you to everyone who participated! Check back for the next challenge.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-obsidian border border-white/[0.06] p-8">
                  <p className="text-steel text-center mb-6 max-w-2xl mx-auto">
                    {settings?.game_description || "Check out the reference models below. Use these as your starting point for modifications and improvements."}
                  </p>
                  <div className="grid md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((model) => {
                      const linkKey = `model_link_${model}` as keyof CadathonSettings
                      const link = settings?.[linkKey] as string | undefined
                      if (!link) return null
                      return (
                        <div key={model} className={`${productCard} group`}>
                          <div className="h-48 bg-molten/[0.06] flex items-center justify-center border-b border-white/[0.06]">
                            <Rocket className="h-12 w-12 text-molten/40" />
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-semibold mb-2">Base Model {model}</h3>
                            <p className="text-steel text-sm mb-4 uppercase tracking-widest">
                              Reference Design
                            </p>
                            <a href={link} target="_blank" rel="noopener noreferrer">
                              <Button className="w-full bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold transition-colors">
                                View in Onshape
                              </Button>
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="container mx-auto px-4 mt-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="mb-20"
            >
              <p className="text-sm uppercase tracking-[0.25em] text-molten text-center mb-2">Overview</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold uppercase tracking-[-0.04em] mb-8 text-center">About the Cadathon</h2>
              <div className="max-w-3xl mx-auto text-steel text-lg leading-relaxed space-y-4">
                <p>
                  The Protara CADathon is a monthly global CAD design competition presented by Protara Printing. Every month brings a brand-new challenge to design a fresh object, mechanism, or system. The competition is open to engineers and designers of all skill levels, all ages, and every CAD software. Entry is always completely free.
                </p>
                <p>
                  Each round, you get a design brief, a judging rubric, and a few weeks to model your best work. Submissions are scored by a neutral panel on CAD quality, feasibility, functionality, aesthetics, and originality, and top entries earn Protara Printing store credit awarded as digital gift codes which work worldwide.
                </p>
                <p>
                  Whether you're a seasoned professional or just opening CAD for the first time, the Cadathon is a low-pressure way to sharpen your skills, build a portfolio, and connect with a global community of makers. Prizes are funded directly through Protara Printing sales, so every model you buy from us helps power the next competition.
                </p>
                <p className="text-molten font-semibold text-xl text-center pt-4">
                  One topic, a few weeks, and a worldwide field of designers. New challenge every month. Come build with us.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="container mx-auto px-4 mt-[30px]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="mb-20"
            >
              <p className="text-sm uppercase tracking-[0.25em] text-molten text-center mb-2">Why Join</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold uppercase tracking-[-0.04em] mb-12 text-center">Why Join the Cadathon?</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className={`${card} p-6`}
                  >
                    <feature.icon className="h-8 w-8 text-molten mb-3" />
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-steel text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="container mx-auto px-4 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-center"
            >
              <div className="bg-molten/10 border border-molten/30 p-8">
                <h2 className="text-3xl font-heading font-bold uppercase tracking-[-0.04em] mb-4">Ready to Compete?</h2>
                <p className="text-steel text-lg mb-6 max-w-2xl mx-auto">
                  Sign up above to join the Cadathon and compete for the {settings?.prize_pool || "$250 prize pool"}. All skill levels, all CAD software, completely free.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <Link href="#">
                    <Button
                      onClick={() => window.scrollTo({ top: 500, behavior: "smooth" })}
                      className="bg-molten hover:bg-molten-ember text-white px-8 py-3 text-lg rounded-none uppercase tracking-widest font-semibold"
                    >
                      Sign Up Now
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="border-molten/40 text-molten hover:bg-molten/10 px-8 py-3 text-lg rounded-none">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}