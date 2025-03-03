"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, ArrowLeft } from "lucide-react"
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

function embedVideo(url: string): string | null {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  )
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return null
}

/** Blog post - single post rendered from the slug with optional video embed. */
export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/blogs?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => setBlog(data.error ? null : data))
      .catch(() => setBlog(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-void text-white">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 pt-36 animate-pulse">
          <div className="h-8 w-64 bg-white/[0.04] mb-4" />
          <div className="h-4 w-32 bg-white/[0.04] mb-8" />
          <div className="h-72 w-full bg-white/[0.04] mb-8" />
          <div className="h-4 w-full bg-white/[0.04] mb-2" />
          <div className="h-4 w-3/4 bg-white/[0.04]" />
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-void text-white">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 pt-40 pb-24 text-center">
          <div className="text-7xl font-heading font-bold text-white/10 mb-6">404</div>
          <h1 className="text-3xl font-heading font-bold mb-4">Blog not found</h1>
          <Link href="/blog" className="text-molten hover:text-molten-ember inline-flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>
        </div>
      </div>
    )
  }

  const embedUrl = blog.video_url ? embedVideo(blog.video_url) : null

  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(0,82,255,0.05) 0%, transparent 50%)", height: "300px", width: "100%" }} />

      <article className="relative max-w-3xl mx-auto px-4 pt-40 pb-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <Link href="/blog" className="text-molten hover:text-molten-ember inline-flex items-center gap-2 mb-8 text-sm uppercase tracking-widest transition-colors duration-150">
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>

          <h1 className="text-3xl md:text-5xl font-heading font-bold uppercase tracking-[-0.03em] mb-6 leading-tight">{blog.title}</h1>

          <div className="flex items-center gap-4 text-sm text-steel mb-10">
            <span className="flex items-center gap-1 uppercase tracking-widest">
              <Calendar className="h-4 w-4 text-molten" />
              {new Date(blog.created_at).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </span>
          </div>

          {blog.image_url && (
            <img src={blog.image_url} alt={blog.title} className="w-full mb-10 max-h-96 object-cover border border-white/[0.06]" />
          )}

          {embedUrl && (
            <div className="relative w-full aspect-video mb-10 overflow-hidden border border-white/[0.06] bg-obsidian">
              <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allowFullScreen />
            </div>
          )}

          <div
            className="prose prose-invert max-w-none
              prose-headings:text-white prose-headings:font-bold prose-headings:font-heading
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:uppercase
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:uppercase
              prose-p:text-chrome prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-molten prose-a:hover:underline
              prose-strong:text-white
              prose-ul:text-chrome prose-ol:text-chrome
              prose-li:mb-1
              prose-img:border prose-img:border-white/10 prose-img:my-6
              prose-blockquote:border-molten prose-blockquote:text-steel
              prose-code:text-molten prose-code:bg-white/5 prose-code:px-1
              prose-pre:bg-obsidian prose-pre:border prose-pre:border-white/10"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <div className="mt-12 pt-8 border-t border-white/[0.06]">
            <Link href="/blog" className="text-molten hover:text-molten-ember text-sm uppercase tracking-widest transition-colors duration-150">
              ← All articles
            </Link>
          </div>
        </motion.div>
      </article>
    </div>
  )
}