import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] text-white px-6">
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight">PROTARA</h1>
      <p className="mt-4 text-lg text-white/70 text-center max-w-md">
        Custom 3D printing services and products
      </p>
      <Link
        href="/catalogue"
        className="mt-8 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3 transition-colors"
      >
        Browse the Catalogue
      </Link>
    </div>
  )
}