"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit3, Trash2, ArrowLeft } from "lucide-react"
import Navigation from "@/app/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Blog = {
  id: number
  title: string
  slug: string
  content: string
  image_url: string
  video_url: string
  created_at: string
  updated_at: string
}

/** Admin blog management - CRUD for blog posts with image upload. */
export default function AdminBlogs() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [mode, setMode] = useState<"list" | "new" | "edit">("list")
  const [editingId, setEditingId] = useState<number | null>(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const auth = async () => {
    if (!password.trim()) { setPasswordError("Enter password"); return }
    try {
      const res = await fetch("/api/products/verify-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) { setAuthorized(true); setPasswordError("") }
      else setPasswordError("Invalid password")
    } catch { setPasswordError("Error verifying password") }
  }

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/blogs")
      if (res.ok) setBlogs(await res.json())
      else setError("Failed to fetch blogs")
    } catch { setError("Failed to fetch blogs") }
    finally { setLoading(false) }
  }

  useEffect(() => { if (authorized) fetchBlogs() }, [authorized])

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("file", files[0])
      fd.append("bucket", "blog-images")
      fd.append("prefix", "blogs")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      setImageUrl(data.url)
    } catch { setError("Upload failed") }
    finally { setUploading(false) }
  }

  const resetForm = () => {
    setTitle(""); setContent(""); setImageUrl(""); setVideoUrl("")
    setEditingId(null)
  }

  const startEdit = (b: Blog) => {
    setEditingId(b.id); setTitle(b.title); setContent(b.content)
    setImageUrl(b.image_url); setVideoUrl(b.video_url); setMode("edit")
  }

  const save = async () => {
    if (!title.trim() || !content.trim()) { setError("Title and content are required"); return }
    setSaving(true); setError("")
    try {
      const body: Record<string, unknown> = { password, title: title.trim(), content: content.trim(), image_url: imageUrl, video_url: videoUrl }
      if (editingId) body.id = editingId
      const res = await fetch("/api/blogs", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Save failed") }
      setSuccess(editingId ? "Blog updated" : "Blog created")
      resetForm(); setMode("list"); fetchBlogs()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Save failed") }
    finally { setSaving(false) }
  }

  const deleteBlog = async (id: number) => {
    if (!confirm("Delete this blog?")) return
    try {
      const res = await fetch(`/api/blogs?id=${id}&password=${encodeURIComponent(password)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setSuccess("Blog deleted"); fetchBlogs()
    } catch { setError("Delete failed") }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-void text-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-obsidian backdrop-blur-sm border border-white/[0.08] rounded-xl p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Admin - Blogs</h1>
            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && auth()}
                className="w-full bg-obsidian border border-white/[0.08] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-molten"
                placeholder="Enter admin password"
              />
              {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
              <Button onClick={auth} className="w-full bg-molten hover:bg-molten-ember text-white">Authenticate</Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void text-white">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 pt-48 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {mode === "list" ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold text-molten">Blog Posts</h1>
                <Button onClick={() => { resetForm(); setMode("new") }} className="bg-molten hover:bg-molten-ember text-white">
                  <Plus className="h-4 w-4 mr-2" /> New Blog
                </Button>
              </div>

              {error && <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500/50"><AlertDescription>{error}</AlertDescription></Alert>}
              {success && <Alert className="mb-6 bg-green-900/20 border-green-500/50"><AlertDescription className="text-green-300">{success}</AlertDescription></Alert>}

              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map((i) => <div key={i} className="h-24 bg-obsidian rounded-lg animate-pulse" />)}
                </div>
              ) : blogs.length === 0 ? (
                <p className="text-steel text-center py-12">No blog posts yet.</p>
              ) : (
                <div className="space-y-3">
                  {blogs.map((b) => (
                    <div key={b.id} className="bg-obsidian/40 border-white/[0.08] backdrop-blur border rounded-lg p-4 flex items-start gap-4 hover:border-molten/30 transition-colors">
                      {b.image_url && (
                        <img src={b.image_url} alt="" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{b.title}</h3>
                        <p className="text-steel text-sm truncate mt-1">{b.content.replace(/<[^>]*>/g, "").slice(0, 120)}</p>
                        <p className="text-steel/70 text-xs mt-1">{new Date(b.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(b)} className="text-chrome hover:text-molten">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteBlog(b.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => { resetForm(); setMode("list") }} className="text-chrome hover:text-molten">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <h1 className="text-4xl font-bold text-molten">{editingId ? "Edit Blog" : "New Blog"}</h1>
              </div>

              {error && <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500/50"><AlertDescription>{error}</AlertDescription></Alert>}

              <div className="bg-obsidian backdrop-blur-sm border border-white/[0.08] rounded-xl p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-chrome mb-1">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blog title" className="bg-obsidian border-white/[0.08] text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-chrome mb-1">Content</label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your blog content here... (HTML supported)" className="bg-obsidian border-white/[0.08] text-white min-h-[400px]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-chrome mb-1">Thumbnail Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    disabled={uploading}
                    className="bg-obsidian border-white/[0.08] text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-molten file:text-white hover:file:bg-molten"
                  />
                  {uploading && <p className="text-sm text-steel mt-2">Uploading image...</p>}
                  {imageUrl && !uploading && (
                    <div className="mt-3 relative inline-block">
                      <img src={imageUrl} alt="" className="h-40 object-cover rounded-lg border border-white/[0.08]" />
                      <button
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-steel/70 mt-1">Or paste an image URL:</p>
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="bg-obsidian border-white/[0.08] text-white mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-chrome mb-1">Video URL (optional)</label>
                  <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube / Vimeo URL" className="bg-obsidian border-white/[0.08] text-white" />
                  <p className="text-xs text-steel/70 mt-1">Upload your video to YouTube or Vimeo, then paste the link here.</p>
                </div>

                <p className="text-xs text-steel/70">HTML is supported in content. Use &lt;img&gt;, &lt;iframe&gt;, &lt;h2&gt;, &lt;p&gt; tags etc.</p>

                <div className="flex gap-3 pt-2">
                  <Button onClick={save} disabled={saving} className="bg-molten hover:bg-molten-ember text-white">
                    {saving ? "Saving..." : (editingId ? "Update Blog" : "Create Blog")}
                  </Button>
                  <Button variant="outline" onClick={() => { resetForm(); setMode("list") }} className="border-white/[0.08] text-chrome hover:bg-obsidian">
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
