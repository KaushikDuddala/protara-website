"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, ArrowRight } from "lucide-react"
import Navigation from "@/app/components/navigation"

type Blog = {
  id: number
  title: string
  slug: string
  content: string
  image_url: string
  video_url: string
  created_at: string
}

/** Blog index - featured post and grid of all blog posts. */
export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/blogs")
      .then((r) => r.json())
      .then((data) => setBlogs(Array.isArray(data) ? data : []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false))
  }, [])

  const [featured, ...rest] = blogs

  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(0,82,255,0.05) 0%, transparent 50%)", height: "350px", width: "100%" }} />

      <div className="relative max-w-5xl mx-auto px-4 pt-36 pb-24">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <p className="text-molten text-sm uppercase tracking-[0.25em] text-center mb-4">The Journal</p>
          <h1 className="text-5xl md:text-6xl font-heading font-bold uppercase tracking-[-0.04em] text-center mb-4">Blog</h1>
          <p className="text-steel text-center text-lg max-w-xl mx-auto">
            Updates, tutorials, and behind-the-scenes from the Protara team.
          </p>
          <div className="flex items-center gap-4 justify-center mt-6">
            <div className="w-12 h-[2px] bg-molten" />
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-14">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-white/[0.04] mb-4" />
                  <div className="h-5 bg-white/[0.04] w-3/4 mb-3" />
                  <div className="h-3 bg-white/[0.04] w-full mb-2" />
                  <div className="h-3 bg-white/[0.04] w-1/2" />
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <p className="text-steel text-center py-24 uppercase tracking-widest text-sm">No blog posts yet.</p>
          ) : (
            <>
              {featured && (
                <Link href={`/blog/${featured.slug}`} className="block mt-14 group">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    className="grid md:grid-cols-2 gap-0 bg-obsidian border border-white/[0.06] card-ignite overflow-hidden"
                  >
                    <div className="relative overflow-hidden">
                      {featured.image_url ? (
                        <img src={featured.image_url} alt={featured.title} className="h-full w-full object-cover min-h-56" />
                      ) : (
                        <div className="h-full min-h-56 bg-molten/10 flex items-center justify-center">
                          <span className="font-heading font-bold text-7xl text-molten/30">{featured.title[0]}</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-molten text-white px-3 py-1 text-xs uppercase tracking-widest">
                        Featured
                      </div>
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4 leading-tight group-hover:text-molten transition-colors duration-150">
                        {featured.title}
                      </h2>
                      <p className="text-steel mb-6 line-clamp-3">
                        {featured.content.replace(/<[^>]*>/g, "").slice(0, 260)}
                      </p>
                      <div className="flex items-center justify-between text-xs text-steel">
                        <span className="flex items-center gap-1 uppercase tracking-widest">
                          <Calendar className="h-3 w-3" />
                          {new Date(featured.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="text-molten flex items-center gap-1 uppercase tracking-widest">
                          Read <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-10">
                {rest.map((b, i) => (
                  <Link key={b.id} href={`/blog/${b.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: "easeOut" }}
                      whileHover={{ y: -4 }}
                      className="bg-obsidian border border-white/[0.06] card-ignite transition-all duration-150 h-full flex flex-col group"
                    >
                      <div className="h-44 overflow-hidden">
                        {b.image_url ? (
                          <img src={b.image_url} alt={b.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : b.video_url ? (
                          <div className="h-full w-full bg-resonance/10 flex items-center justify-center">
                            <div className="w-14 h-14 border border-resonance/40 flex items-center justify-center">
                              <div className="w-0 h-0 border-t-8 border-b-8 border-l-[12px] border-transparent border-l-resonance ml-1" />
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full bg-molten/10 flex items-center justify-center">
                            <span className="text-5xl font-heading font-bold text-molten/30">{b.title[0]}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h2 className="font-heading font-bold text-white mb-2 line-clamp-2 group-hover:text-molten transition-colors duration-150">{b.title}</h2>
                        <p className="text-steel text-sm mb-4 flex-1 line-clamp-3 leading-relaxed">
                          {b.content.replace(/<[^>]*>/g, "").slice(0, 200)}
                        </p>
                        <div className="flex items-center justify-between text-xs text-steel">
                          <span className="flex items-center gap-1 uppercase tracking-widest">
                            <Calendar className="h-3 w-3" />
                            {new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="text-molten flex items-center gap-1 uppercase tracking-widest">
                            Read <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}