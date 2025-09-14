import Navigation from "@/app/components/navigation"
import { Mail, Phone, Instagram, MessageSquare } from "lucide-react"

/** Contact page - contact channel cards with mailto/tel/social links. */
export default function ContactPage() {
  const channels = [
    {
      icon: Mail,
      label: "Email",
      value: "support@protaraprinting.com",
      href: "mailto:support@protaraprinting.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (469) 827-7605",
      href: "tel:+14698277605",
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: "@ProtaraPrinting",
      href: "https://www.instagram.com/ProtaraPrinting",
    },
  ]

  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,69,0,0.05) 0%, transparent 50%)", height: "350px", width: "100%" }} />

      <div className="relative container mx-auto px-4 pt-40 pb-28">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-molten text-sm uppercase tracking-[0.25em] mb-4">Open Channel</p>
          <h1 className="text-5xl md:text-6xl font-heading font-bold uppercase tracking-[-0.04em] mb-4">Contact Us</h1>
          <p className="text-steel text-lg">
            Have a question, need help, or want to discuss a custom order? Reach out and we'll get back to you as soon as possible.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-14 h-[2px] bg-molten" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {channels.map((channel, i) => (
            <a
              key={channel.label}
              href={channel.href}
              target={channel.icon === Instagram ? "_blank" : undefined}
              rel={channel.icon === Instagram ? "noopener noreferrer" : undefined}
              className="group bg-obsidian border border-white/[0.06] p-8 text-center card-ignite transition-colors"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-molten/10 border border-molten/30 flex items-center justify-center mx-auto mb-5 group-hover:bg-molten group-hover:border-molten transition-all duration-150">
                <channel.icon className="h-6 w-6 text-molten group-hover:text-white transition-colors duration-150" />
              </div>
              <div className="text-sm uppercase tracking-widest text-steel mb-1">{channel.label}</div>
              <div className="text-chrome font-heading font-bold group-hover:text-molten transition-colors duration-150 break-all">{channel.value}</div>
            </a>
          ))}
        </div>

        <p className="text-steel text-center text-sm mt-10 flex items-center justify-center gap-2">
          <MessageSquare className="h-4 w-4 text-molten" />
          We typically respond within 24 hours.
        </p>
      </div>
    </div>
  )
}