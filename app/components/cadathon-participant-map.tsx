/** Renders the Cadathon participant world map image. */
export default function CadathonParticipantMap() {
  return (
    <div className="bg-obsidian border border-white/[0.08] overflow-hidden">
      <div className="relative">
        <img
          src="/cadathon_world_map.png"
          alt="Cadathon participant map"
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  )
}
