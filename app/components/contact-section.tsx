import { Mail, Phone, Instagram } from "lucide-react"

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    details: "support@protaraprinting.com",
    href: "mailto:support@protaraprinting.com",
  },
  {
    icon: Phone,
    title: "Phone",
    details: "+1 (469) 827-7605",
    href: "tel:+14698277605",
  },
  {
    icon: Instagram,
    title: "Instagram",
    details: "@protaraprinting",
    href: "https://instagram.com/protaraprinting",
  },
]

export default function ContactSection() {
  return (
    <section id="contact" className="py-16 bg-[#0a0a0f]">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-white text-3xl font-bold mb-8">Get In Touch</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {contactInfo.map((info) => (
            <div key={info.title} className="bg-[#12121a] border border-white/10 p-6 text-center">
              <div className="mx-auto mb-3 flex items-center justify-center w-10 h-10 bg-orange-500/10 border border-orange-500/30">
                <info.icon className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="text-white font-bold mb-1">{info.title}</h3>
              <a href={info.href} className="text-sm text-orange-500 hover:text-orange-400">
                {info.details}
              </a>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-white/60">© 2024 Protara. All rights reserved.</p>
        </div>
      </div>
    </section>
  )
}