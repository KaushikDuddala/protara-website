"use client"

import { motion } from "framer-motion"
import Navigation from "../components/navigation"

interface TeamMember {
  name: string
  role: string
  description: string
  image?: string
}

const leadership: TeamMember[] = [
  { name: "Jayden", role: "CEO / Co-Founder", description: "" },
  { name: "Kaushik", role: "CTO / Co-Founder", description: "" },
  { name: "Aarush", role: "COO / Co-Founder", description: "" },
]

const marketing: TeamMember[] = [
  { name: "Alex", role: "VP of Finances", description: "" },
  { name: "Eric", role: "VP of Product", description: "" },
  { name: "Vihaan", role: "VP of Marketing", description: "" },
]

const outreach: TeamMember[] = [
  { name: "Avin", role: "VP of Outreach", description: "" },
]

const rd: TeamMember[] = [
  { name: "Greg", role: "Senior R&D Manager", description: "" },
  { name: "Siddharth", role: "VP of Innovation", description: "" },
  { name: "Hitu", role: "R&D Manager", description: "" },
  { name: "Tamoghna", role: "R&D Manager", description: "" },
  { name: "Victor", role: "R&D Manager", description: "" },
  { name: "Louisa", role: "R&D Manager", description: "" },
]

function MemberCard({ member, index, size }: { member: TeamMember; index: number; size?: "lg" }) {
  const large = size === "lg"
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className={`bg-obsidian border border-white/[0.06] card-ignite text-center transition-colors ${large ? "p-8 min-h-[280px] flex flex-col items-center justify-center" : "p-6"}`}
    >
      <div className={`mx-auto mb-4 bg-molten/10 border border-molten/30 flex items-center justify-center overflow-hidden ${large ? "w-32 h-32" : "w-20 h-20"}`}>
        {member.image ? (
          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className={`font-heading font-bold text-molten ${large ? "text-5xl" : "text-3xl"}`}>{member.name.charAt(0)}</span>
        )}
      </div>
      <h3 className={`font-heading font-bold text-white ${large ? "text-2xl" : "text-lg"}`}>{member.name}</h3>
      <p className={`text-molten font-medium mb-2 ${large ? "text-base" : "text-sm"} uppercase tracking-wider`}>{member.role}</p>
      {member.description && (
        <p className={`text-steel ${large ? "text-sm" : "text-sm"}`}>{member.description}</p>
      )}
    </motion.div>
  )
}

function TeamSection({ title, members, layout, size }: { title: string; members: TeamMember[]; layout: "row" | "grid"; size?: "lg" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="mb-16"
    >
      <div className="flex items-center gap-4 mb-8 justify-center">
        <div className="h-[2px] w-10 bg-molten" />
        <h2 className="text-lg font-heading font-bold text-white uppercase tracking-widest text-center">{title}</h2>
        <div className="h-[2px] w-10 bg-molten" />
      </div>
      <div className={layout === "row" ? "flex flex-wrap justify-center gap-6" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-4xl mx-auto"}>
        {members.map((member, i) => (
          <div key={member.name} className={layout === "row" ? "w-80" : ""}>
            <MemberCard member={member} index={i} size={size} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/** Team page - team member showcase grouped by department. */
export default function TeamPage() {
  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,69,0,0.05) 0%, transparent 50%)", height: "350px", width: "100%" }} />

      <div className="relative container mx-auto px-4 pt-36 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <p className="text-molten text-sm uppercase tracking-[0.25em] mb-4">The Engineers</p>
          <h1 className="text-5xl md:text-6xl font-heading font-bold uppercase tracking-[-0.04em] mb-4">
            Meet the Team
          </h1>
          <p className="text-steel text-lg max-w-xl mx-auto">
            The people behind Protara Printing.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-14 h-[2px] bg-molten" />
          </div>
        </motion.div>

        <TeamSection title="Leadership" members={leadership} layout="row" size="lg" />
        <TeamSection title="Marketing Subteam" members={marketing} layout="grid" />
        <TeamSection title="Outreach Subteam" members={outreach} layout="grid" />
        <TeamSection title="R&D Subteam" members={rd} layout="grid" />
      </div>
    </div>
  )
}