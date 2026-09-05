"use client"

import { Mail, Phone, MapPin } from "lucide-react"

/** Contact info cards (email, phone, location) with a site footer. */
export default function ContactSection() {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "support@protaraprinting.com",
      subtitle: "We'll respond within 24 hours",
      href: "mailto:support@protaraprinting.com",
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+1 (469) 827-7605",
      subtitle: "Available for texts and calls",
      href: "tel:+14698277605",
    },
    {
      icon: MapPin,
      title: "Location",
      details: "Dallas, TX",
      subtitle: "Serving customers worldwide",
      href: null,
    },
  ]

  return (
    <section data-major-section id="contact" className="py-28 bg-void relative">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0, 82, 255, 0.06) 0%, transparent 60%)" }} />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <p className="text-molten text-sm uppercase tracking-[0.25em] mb-4">Open Channel</p>
          <h2 className="font-heading font-bold uppercase tracking-[-0.03em] text-white text-4xl md:text-5xl">
            Get In Touch
          </h2>
          <div className="w-14 h-[2px] bg-molten mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {contactInfo.map((info) => (
            <div key={info.title} className="bg-obsidian border border-white/[0.06] rounded-none p-8 text-center transition-colors hover:border-white/20">
              <div className="w-12 h-12 bg-molten/10 border border-molten/30 flex items-center justify-center mx-auto mb-4">
                <info.icon className="h-5 w-5 text-molten" />
              </div>
              <h3 className="text-white font-heading font-bold mb-1">{info.title}</h3>
              {info.href ? (
                <a href={info.href} className="text-molten font-medium hover:text-molten-ember transition-colors text-sm">
                  {info.details}
                </a>
              ) : (
                <p className="text-molten font-medium text-sm">{info.details}</p>
              )}
              <p className="text-steel text-sm mt-1">{info.subtitle}</p>
            </div>
          ))}
        </div>

        <footer className="mt-20 pt-8 border-t border-white/[0.06] text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-heading font-bold uppercase tracking-[-0.02em] text-white">
              PROTARA
            </div>
            <div className="flex gap-6 text-steel">
              <a href="/terms.html" className="hover:text-molten transition-colors text-sm">
                Terms of Service
              </a>
              <a href="/contact" className="hover:text-molten transition-colors text-sm">
                Support
              </a>
            </div>
          </div>
          <div className="mt-4 text-steel text-sm">© 2026 Protara. All rights reserved. Advanced 3D Printing Solutions.</div>
        </footer>
      </div>
    </section>
  )
}
