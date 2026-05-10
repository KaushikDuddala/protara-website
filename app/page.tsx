"use client"

import { useEffect, useState } from "react"
import ProductShowcase from "./components/product-showcase"
import TestimonialCarousel from "./components/testimonial-carousel"
import ContactSection from "./components/contact-section"
import HomeFilm, { CustomPrintBeat, FunnelStrip, StatsBeat } from "./components/home-film"
import Link from "next/link"

/** Home page - hero film, product showcase, testimonials, and contact section. */
export default function HomePage() {
  const [testimonials, setTestimonials] = useState<any[]>([])

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials")
        if (response.ok) {
          const data = await response.json()
          setTestimonials(data.testimonials || [])
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error)
      }
    }

    fetchTestimonials()
  }, [])

  return (
    <div className="min-h-screen bg-void overflow-x-clip home-snap">

      <HomeFilm />

      <FunnelStrip />

      <StatsBeat />

      <ProductShowcase />

      <CustomPrintBeat />

      <section data-major-section className="py-24 bg-void relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-molten text-sm uppercase tracking-[0.25em] mb-4">Evidence</p>
            <h2 className="font-heading font-bold uppercase tracking-[-0.03em] text-white text-4xl md:text-5xl">
              What Our Customers Say
            </h2>
            <div className="w-14 h-[2px] bg-molten mx-auto mt-6" />
          </div>
          <TestimonialCarousel testimonials={testimonials} />
          <div className="text-center mt-12">
            <Link href="/submit-testimonial">
              <span className="inline-flex items-center bg-molten hover:bg-molten-ember text-white px-8 py-4 rounded-none uppercase tracking-widest font-semibold text-sm transition-colors">
                Share Your Experience
              </span>
            </Link>
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  )
}
