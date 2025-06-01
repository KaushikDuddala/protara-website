"use client"

import { useEffect, useState } from "react"

const EVENT_DATE = new Date("2025-02-15T09:00:00-06:00")

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, EVENT_DATE.getTime() - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export default function CadathonPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-white text-4xl font-bold mb-4">Protara Cadathon</h1>
        <p className="text-white/60 leading-relaxed mb-8">
          A 36-hour hackathon where middle and high school students team up, learn CAD, and design
          3D-printable things. Mentors help you along the way and the best designs get printed and
          sold in the Protara shop.
        </p>

        <div className="bg-[#12121a] border border-white/10 p-8 text-center mb-8">
          <p className="text-white/50 text-sm uppercase tracking-widest mb-4">Hackathon Starts In</p>
          <div className="flex justify-center gap-6">
            <div>
              <p className="text-white text-4xl font-bold">{pad(timeLeft.days)}</p>
              <p className="text-white/50 text-xs uppercase">Days</p>
            </div>
            <div>
              <p className="text-white text-4xl font-bold">{pad(timeLeft.hours)}</p>
              <p className="text-white/50 text-xs uppercase">Hours</p>
            </div>
            <div>
              <p className="text-white text-4xl font-bold">{pad(timeLeft.minutes)}</p>
              <p className="text-white/50 text-xs uppercase">Minutes</p>
            </div>
            <div>
              <p className="text-white text-4xl font-bold">{pad(timeLeft.seconds)}</p>
              <p className="text-white/50 text-xs uppercase">Seconds</p>
            </div>
          </div>
        </div>

        <a
          href="https://discord.gg/protara"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 transition-colors"
        >
          Join the Discord
        </a>
      </div>
    </div>
  )
}