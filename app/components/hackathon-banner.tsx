"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, X } from "lucide-react"
import { usePathname } from "next/navigation"

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
}

/** Fixed banner showing the Cadathon countdown; collapses on scroll when on the home page. */
export default function HackathonBanner() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const [scrolled, setScrolled] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [settings, setSettings] = useState<CadathonSettings | null>(null)
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [phase, setPhase] = useState<"before" | "during" | "after">("before")

  useEffect(() => {
    fetch("/api/cadathon/settings")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setSettings(data))
      .catch(() => null)
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

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrolled])

  const isCompact = isHomePage && scrolled

  // BUG: banner_enabled is never checked, so the banner shows even when disabled in settings.
  if (!settings || pathname === "/cadathon" || isClosed || !isLoaded) {
    return null
  }

  const countdownLabel = phase === "before" ? "Starts in" : phase === "during" ? "Ends in" : "Ended"
  const showCountdown = phase !== "after"

  const cells = [
    { label: "Days", value: countdown.days },
    { label: "Hours", value: countdown.hours },
    { label: "Min", value: countdown.minutes },
    { label: "Sec", value: countdown.seconds },
  ]

  return (
    <>
      <div className={`transition-all duration-300 ease-in-out ${isCompact ? "h-12" : "h-20"}`} />
      <div className={`w-full bg-obsidian border-b border-molten/20 text-white fixed top-16 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${isCompact ? "py-2" : "py-4"}`}>
        <button
          onClick={() => setIsClosed(true)}
          className="absolute top-3 right-3 text-steel hover:text-white transition-colors duration-150"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-3 max-w-5xl mx-auto">
            <div className="text-center lg:text-left">
              <h2 className={`font-heading font-bold uppercase tracking-[-0.02em] ${isCompact ? "text-sm" : "text-base"}`}>
                Cadathon <span className="text-molten">REACH</span>
              </h2>
              <p className={`text-steel hidden md:block ${isCompact ? "text-xs" : "text-sm"}`}>{settings.prize_pool}</p>
            </div>

            {showCountdown && (
              <div className={`flex items-center gap-1.5 ${isCompact ? "text-xs" : "text-sm"}`}>
                <span className="mr-2 text-steel hidden sm:inline">{countdownLabel}</span>
                {cells.map((cell, i) => (
                  <div key={cell.label} className="flex items-center gap-1.5">
                    <div className="bg-white/[0.06] border border-white/10 px-2.5 py-1 text-center min-w-[52px]">
                      <div className="font-heading font-bold text-white leading-none">
                        {String(cell.value).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-steel mt-0.5">{cell.label}</div>
                    </div>
                    {i < cells.length - 1 && <span className="text-steel">:</span>}
                  </div>
                ))}
              </div>
            )}

            {phase === "after" && (
              <div className="text-steel font-semibold text-sm uppercase tracking-widest">Event has concluded</div>
            )}

            <Link
              href="/cadathon"
              className="flex items-center gap-1.5 bg-molten hover:bg-molten-ember text-white px-4 py-2 text-sm font-semibold uppercase tracking-widest transition-colors duration-150 whitespace-nowrap"
            >
              Learn More
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}