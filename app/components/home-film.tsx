"use client"

import Link from "next/link"
import { ArrowRight, ChevronDown, Layers, Printer, Shield, Users } from "lucide-react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { usePinProgress } from "@/hooks/use-pin-progress"

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"

/** Stacked hex plates on a spine with bottom-up lighting controlled by `lit`. */
function HexStack({ size = 160, gap = 32, lit = 6, glow = false, count = 6 }: { size?: number; gap?: number; lit?: number; glow?: boolean; count?: number }) {
  const plates = Array.from({ length: count })
  const litCount = Math.max(0, Math.min(count, lit))
  const fullyLit = litCount === count

  return (
    <div className="relative" style={{ width: size, height: size + gap * (plates.length - 1) + gap }}>
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0"
        style={{
          width: 6,
          height: size + gap * (plates.length - 1) + gap,
          background: fullyLit ? "rgba(255,69,0,0.35)" : "rgba(138,138,154,0.35)",
          transition: "background 0.4s ease",
        }}
      />
      {plates.map((_, i) => {
        const isLit = i >= count - litCount // bottom plates first
        const isTop = i === 0
        return (
          <div
            key={i}
            className="absolute left-1/2"
            style={{
              width: size,
              height: size,
              bottom: (plates.length - 1 - i) * gap + gap,
              clipPath: HEX_CLIP,
              transform: "translateX(-50%)",
              transition: "background 0.35s ease, box-shadow 0.35s ease",
              background: isLit
                ? isTop
                  ? "linear-gradient(180deg,#FF6B2C,#FF4500)"
                  : "linear-gradient(180deg,#262633,#14141c)"
                : "linear-gradient(180deg,#181822,#0a0a0f)",
              boxShadow:
                isLit && isTop && glow
                  ? "0 0 40px rgba(255,69,0,0.45), inset 0 0 18px rgba(255,255,255,0.07)"
                  : isLit
                    ? "0 0 18px rgba(255,69,0,0.18), inset 0 0 18px rgba(255,255,255,0.06)"
                    : "inset 0 0 18px rgba(255,255,255,0.05)",
            }}
          />
        )
      })}
      <div
        className="absolute left-1/2"
        style={{
          width: size + 56,
          height: 12,
          bottom: 0,
          borderRadius: "50%",
          background: "#0a0a0f",
          border: "1px solid rgba(255,255,255,0.12)",
          transform: "translateX(-50%)",
        }}
      />
    </div>
  )
}

// TODO: fixed 100vh stage clips hero content on short viewports - should be min-h-screen.
// TODO: the HomeFilm timeline always runs; add a reduced-motion branch that shows the static state.
/** Static landing hero with the signature hex object and two CTA buttons. */
export default function HomeFilm() {
  return (
    <section data-major-section className="relative h-screen flex items-center justify-center bg-void overflow-hidden pt-32 pb-16">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,82,255,0.06) 0%, transparent 55%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 85%, rgba(255,69,0,0.06) 0%, transparent 55%)" }}
      />

      <div className="relative container mx-auto px-4 text-center flex flex-col items-center">
        <p className="hud-label mb-12">PROTARA / OBJECT 001</p>

        <div className="mb-16 flex items-end">
          <HexStack size={168} gap={34} lit={6} glow />
        </div>

        <h1 className="font-heading font-bold uppercase tracking-[-0.04em] text-white text-6xl md:text-8xl leading-none">
          PROTARA
        </h1>
        <p className="mt-5 text-steel text-xs md:text-sm uppercase tracking-[0.3em]">
          ENGINEERED IN PLASTIC
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link href="/catalogue">
            <span className="inline-flex items-center gap-2 bg-molten hover:bg-molten-ember text-white px-10 py-5 rounded-none uppercase tracking-widest font-semibold text-sm transition-colors">
              Shop the collection
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link href="/custom-print-request">
            <span className="inline-flex items-center gap-2 border border-white/15 text-chrome hover:text-white hover:bg-white/5 hover:border-white/25 px-10 py-5 rounded-none uppercase tracking-widest text-sm transition-colors">
              Request a custom print
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}

/** Pinned scroll chapter showing the custom-print workflow (Describe → Design → Slice → Ship). */
export function CustomPrintBeat() {
  const reduced = useReducedMotion()
  const { ref: sectionRef, progress } = usePinProgress()

  const HOLD = 0.75
  const raw = Math.min(1, Math.max(0, progress))
  const p = reduced ? 1 : Math.min(1, raw / HOLD)

  const PLATES = 4
  const stepIdx = Math.min(PLATES - 1, Math.floor(p * PLATES))
  const sub = Math.max(0, Math.min(1, p * PLATES - stepIdx))
  const fire = sub >= 0.5 ? 1 : 0
  const openCount = Math.min(PLATES, stepIdx + fire)
  const lit = Math.min(PLATES, stepIdx + fire)

  const steps = [
    {
      title: "Describe",
      status: "BRIEF",
      body: "Tell us the size, colour, finish, and quantity - a couple of sentences is all it takes. Sketches or reference photos speed things up.",
    },
    {
      title: "We Design",
      status: "CAD",
      body: "Our design engineer models your idea and sends a costed CAD draft for approval before anything starts printing.",
    },
    {
      title: "We Slice",
      status: "G-CODE",
      body: "We tune wall thickness, supports, and orientation for strength, speed, and a clean surface finish.",
    },
    {
      title: "Shipped to You",
      status: "SHIP",
      body: "Every part is inspected against your brief, packed, and ships with tracking the day it leaves the studio.",
    },
  ]

  return (
    <section data-major-section ref={sectionRef} className="relative h-[220vh] bg-void">
      <div className="sticky top-0 h-screen overflow-hidden bg-void flex flex-col">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,69,0,0.06) 0%, transparent 55%)" }}
        />
        <div className="absolute inset-0 slicer-grid opacity-30 pointer-events-none" />

        <div className="relative container mx-auto px-4 flex flex-col h-full pt-28 pb-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-molten text-sm uppercase tracking-[0.25em] mb-3">Bespoke Manufacturing</p>
              <h2 className="font-heading font-bold uppercase tracking-[-0.03em] text-white text-3xl md:text-5xl">
                Your idea, printed in plastic
              </h2>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <div className="hud-label text-steel/70 flex items-center gap-2">
                SCROLL
                <ChevronDown className="h-3 w-3 animate-bounce" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 grid md:grid-cols-2 gap-10 items-center">
            <div className="hidden md:flex flex-col items-center gap-6 justify-center">
              <HexStack size={150} gap={28} lit={lit} glow count={4} />
            </div>

            <div className="flex flex-col gap-3 justify-center">
              {steps.map((step, i) => {
                const open = i < openCount
                return (
                  <div
                    key={step.title}
                    className={`rounded-none transition-colors duration-300 ${open ? "bg-obsidian border border-molten/40" : "bg-obsidian border border-white/[0.06]"}`}
                  >
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`hud-label ${open ? "text-molten" : "text-steel"}`}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-heading font-bold uppercase tracking-[-0.02em] text-white text-base md:text-lg">
                          {step.title}
                        </h3>
                        <span className="hidden sm:inline hud-label text-steel/60">{step.status}</span>
                      </div>
                      <span className={`hud-label ${open ? "text-molten" : "text-steel/70"}`}>
                        {open ? "COMPLETE" : "SLOTTED"}
                      </span>
                    </div>
                    <div
                      className="grid transition-[grid-template-rows] duration-500 ease-out"
                      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden min-h-0">
                        <div className="px-5 pb-5 pt-3 border-t border-white/[0.06]">
                          <p className="text-steel leading-relaxed text-sm">{step.body}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <Link href="/custom-print-request">
              <span className="inline-flex items-center gap-2 bg-molten hover:bg-molten-ember text-white px-10 py-5 rounded-none uppercase tracking-widest font-semibold text-sm transition-colors">
                Start a custom request
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Pinned chapter with three expandable paths: request, upload (coming soon), and fundraiser. */
export function FunnelStrip() {
  const reduced = useReducedMotion()
  const { ref, progress } = usePinProgress()

  const p = reduced ? 1 : Math.min(1, Math.max(0, (progress - 0.1) / 0.8))
  const openCount = Math.min(3, Math.ceil(p * 3))

  const items = [
    {
      title: "Request Creation",
      tag: null,
      desc: "Tell us what you want made - size, colour, finish, quantity.",
      body: "We reply within 48 hours with a quote and a CAD preview. Approve it, then we print.",
      href: "/custom-print-request",
      cta: "Start a request",
      disabled: false,
    },
    {
      title: "Upload Creation",
      tag: "Coming Soon",
      desc: "Bring your own 3D model and get it printed.",
      body: "Upload a file, pick material and finish, and check out. Printing starts the same day.",
      href: "/custom-print-request",
      cta: "Coming Soon",
      disabled: true,
    },
    {
      title: "Fundraiser Prints",
      tag: "Support",
      desc: "Limited prints funding The Food Lounge community fridge.",
      body: "Every purchase sends 100% of proceeds directly to the fundraiser. New drops land regularly.",
      href: "/fundraiser",
      cta: "Shop fundraiser",
      disabled: false,
    },
  ]

  return (
    <section data-major-section ref={ref} className="relative h-[280vh] bg-void">
      <div className="sticky top-0 h-screen overflow-hidden bg-void flex flex-col">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,82,255,0.05) 0%, transparent 50%)" }}
        />
        <div className="absolute inset-0 slicer-grid opacity-20 pointer-events-none" />

        <div className="relative container mx-auto px-4 flex flex-col h-full pt-28 pb-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-molten text-sm uppercase tracking-[0.25em] mb-3">Three Ways to Work</p>
              <h2 className="font-heading font-bold uppercase tracking-[-0.03em] text-white text-3xl md:text-5xl">
                Pick a path
              </h2>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <div className="hud-label text-steel/70 flex items-center gap-2">
                SCROLL
                <ChevronDown className="h-3 w-3 animate-bounce" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 grid md:grid-cols-3 gap-5 items-center">
            {items.map((item, i) => {
              const open = i < openCount
              return (
                <div
                  key={item.title}
                  className={`flex flex-col rounded-none transition-colors duration-300 ${
                    open ? "bg-obsidian border border-molten/40" : "bg-obsidian border border-white/[0.06]"
                  } ${item.disabled ? "opacity-80" : ""}`}
                >
                  <div className="flex items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className={`hud-label ${open ? "text-molten" : "text-steel"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-heading font-bold uppercase tracking-[-0.02em] text-white text-lg">
                        {item.title}
                      </h3>
                    </div>
                    {item.tag && (
                      <span className="bg-molten text-white text-[10px] px-2 py-1 uppercase tracking-widest rounded-none">
                        {item.tag}
                      </span>
                    )}
                  </div>

                  <div className="px-6 pb-6">
                    <p className="text-steel text-sm leading-relaxed mb-3">{item.desc}</p>
                    <div
                      className="grid transition-[grid-template-rows] duration-500 ease-out"
                      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden min-h-0">
                        <div className="pt-3 border-t border-white/[0.06]">
                          <p className="text-steel text-sm leading-relaxed mb-4">{item.body}</p>
                          {item.disabled ? (
                            <span className="inline-block text-steel/70 hud-label uppercase tracking-widest">
                              {item.cta}
                            </span>
                          ) : (
                            <Link
                              href={item.href}
                              className="inline-flex items-center gap-2 text-molten text-sm uppercase tracking-widest font-semibold hover:text-molten-ember transition-colors"
                            >
                              {item.cta}
                              <ArrowRight className="h-4 w-4 transition-transform duration-150 hover:translate-x-0.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Pinned chapter with animated stat counters and a progress rail. */
export function StatsBeat() {
  const reduced = useReducedMotion()
  const { ref, progress } = usePinProgress()

  const raw = Math.min(1, Math.max(0, progress))
  const p = reduced ? 1 : Math.min(1, Math.max(0, (raw - 0.05) / 0.9))
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  const stats = [
    { icon: Printer, label: "Sales Completed", value: 2500, suffix: "+", decimals: 0, delay: 0 },
    { icon: Shield, label: "Quality Guarantee", value: 99.99, suffix: "%", decimals: 2, delay: 0.06 },
    { icon: Users, label: "Happy Customers", value: 850, suffix: "+", decimals: 0, delay: 0.12 },
    { icon: Layers, label: "Print Materials", value: 12, suffix: "", decimals: 0, delay: 0.18 },
  ]

  const easedFor = (delay: number) => {
    const local = Math.min(1, Math.max(0, (p - delay) / (1 - delay)))
    return easeInOutCubic(local)
  }

  const tally = (value: number, decimals: number, delay: number) =>
    (value * easedFor(delay)).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })

  return (
    <section data-major-section ref={ref} className="relative h-[260vh] bg-void">
      <div className="sticky top-0 h-screen overflow-hidden bg-void flex flex-col">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,69,0,0.04) 0%, transparent 55%)" }}
        />

        <div className="relative container mx-auto px-4 flex flex-col h-full pt-28 pb-10">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-14">
            <div>
              <p className="text-molten text-sm uppercase tracking-[0.25em] mb-3">Evidence</p>
              <h2 className="font-heading font-bold uppercase tracking-[-0.03em] text-white text-3xl md:text-5xl">
                Numbers that hold
              </h2>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <div className="hud-label text-steel/70 flex items-center gap-2">
                SCROLL
                <ChevronDown className="h-3 w-3 animate-bounce" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-center">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center py-6">
                <stat.icon className="h-6 w-6 text-molten mx-auto mb-6" />
                <div className="font-heading font-bold text-white text-5xl md:text-6xl xl:text-7xl tracking-[-0.03em] tabular-nums">
                  {tally(stat.value, stat.decimals, stat.delay)}
                  <span className="text-molten">{stat.suffix}</span>
                </div>
                <div className="text-steel text-xs uppercase tracking-widest mt-4">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="h-[2px] w-full bg-white/[0.06]">
            <div className="h-full bg-molten" style={{ width: `${Math.min(100, Math.round(easedFor(0) * 100))}%` }} />
          </div>
        </div>
      </div>
    </section>
  )
}