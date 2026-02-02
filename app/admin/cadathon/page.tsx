"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Lock, Save, Users, Settings, Eye, EyeOff, Megaphone, Plus, Trash2, Pencil, X, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navigation from "@/app/components/navigation"

interface CadathonSettings {
  banner_enabled: boolean
  start_date: string | null
  end_date: string | null
  prize_pool: string
  discord_link: string
  registration_open: boolean
  minimum_signups: number
  model_link_1: string
  model_link_2: string
  model_link_3: string
  game_description: string
}

interface Announcement {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

interface Signup {
  id: number
  name: string
  phone: string | null
  email: string
  age: number | null
  location_state: string | null
  created_at: string
}

/** Admin cadathon settings - event configuration, announcements, and signup viewer. */
export default function AdminCadathonPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")
  const [loading, setLoading] = useState(false)

  const [settings, setSettings] = useState<CadathonSettings>({
    banner_enabled: false,
    start_date: null,
    end_date: null,
    prize_pool: "$250 Prize Pool",
    discord_link: "",
    registration_open: false,
    minimum_signups: 0,
    model_link_1: "",
    model_link_2: "",
    model_link_3: "",
    game_description: "",
  })
  const [signups, setSignups] = useState<Signup[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showSignups, setShowSignups] = useState(false)

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState("")
  const [newAnnouncement, setNewAnnouncement] = useState("")
  const [editingAnnouncement, setEditingAnnouncement] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [announcementLoading, setAnnouncementLoading] = useState(false)

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/cadathon/settings")
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch {
    }
  }

  const fetchSignups = async () => {
    try {
      const res = await fetch(`/api/cadathon/signups?password=${encodeURIComponent(password)}`)
      if (res.ok) {
        const data = await res.json()
        setSignups(data)
      }
    } catch {
      setError("Failed to load signups")
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/cadathon/announcements")
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data)
      }
    } catch {
      // ignore
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    setLoading(true)

    try {
      const res = await fetch("/api/products/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Invalid password")
      }

      setIsAuthenticated(true)
      await fetchSettings()
      await fetchAnnouncements()
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const payload = {
        password,
        banner_enabled: settings.banner_enabled,
        start_date: settings.start_date || null,
        end_date: settings.end_date || null,
        prize_pool: settings.prize_pool,
        discord_link: "",
        registration_open: settings.registration_open,
        minimum_signups: settings.minimum_signups,
        model_link_1: settings.model_link_1,
        model_link_2: settings.model_link_2,
        model_link_3: settings.model_link_3,
        game_description: settings.game_description,
      }

      const res = await fetch("/api/cadathon/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save settings")
      }

      setSuccess("Cadathon settings saved successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setLoading(false)
    }
  }

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.trim()) return
    setAnnouncementLoading(true)
    try {
      const res = await fetch("/api/cadathon/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, title: newAnnouncementTitle.trim(), content: newAnnouncement.trim() }),
      })
      if (res.ok) {
        setNewAnnouncementTitle("")
        setNewAnnouncement("")
        await fetchAnnouncements()
      }
    } catch {
      // ignore
    } finally {
      setAnnouncementLoading(false)
    }
  }

  const handleUpdateAnnouncement = async (id: number) => {
    if (!editContent.trim()) return
    setAnnouncementLoading(true)
    try {
      const res = await fetch("/api/cadathon/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id, title: editTitle.trim(), content: editContent.trim() }),
      })
      if (res.ok) {
        setEditingAnnouncement(null)
        setEditTitle("")
        setEditContent("")
        await fetchAnnouncements()
      }
    } catch {
      // ignore
    } finally {
      setAnnouncementLoading(false)
    }
  }

  const handleDeleteAnnouncement = async (id: number) => {
    setAnnouncementLoading(true)
    try {
      const res = await fetch(`/api/cadathon/announcements?id=${id}&password=${encodeURIComponent(password)}`, {
        method: "DELETE",
      })
      if (res.ok) {
        await fetchAnnouncements()
      }
    } catch {
      // ignore
    } finally {
      setAnnouncementLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-void text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-obsidian border border-white/[0.06]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-molten">
              <Lock className="h-6 w-6" />
              Cadathon Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-chrome">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-obsidian border-white/[0.08] text-white"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              {authError && (
                <Alert className="bg-red-900/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-molten hover:bg-molten-ember"
              >
                {loading ? "Authenticating..." : "Access Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void text-white pt-48">
      <Navigation />
      <div className="p-4 md:p-8 pt-32">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-molten mb-2">
              Cadathon Management
            </h1>
            <p className="text-steel">Configure the Cadathon event settings</p>
          </div>

          {error && (
            <Alert className="mb-4 bg-red-900/20 border-red-500/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-900/20 border-green-500/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-green-300">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
            <Card className="bg-obsidian border border-white/[0.06]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-molten">
                  <Settings className="h-5 w-5" />
                  Event Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-chrome font-medium">Banner Enabled</Label>
                    <p className="text-sm text-steel">
                      Show the Cadathon countdown banner site-wide
                    </p>
                  </div>
                  <Switch
                    checked={settings.banner_enabled}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, banner_enabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-chrome font-medium">Registration Open</Label>
                    <p className="text-sm text-steel">Allow users to sign up for the Cadathon</p>
                  </div>
                  <Switch
                    checked={settings.registration_open}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, registration_open: checked }))}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date" className="text-chrome">Start Date & Time</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={settings.start_date ? settings.start_date.slice(0, 16) : ""}
                      onChange={(e) => setSettings((prev) => ({ ...prev, start_date: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                      className="bg-obsidian border-white/[0.08] text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date" className="text-chrome">End Date & Time</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={settings.end_date ? settings.end_date.slice(0, 16) : ""}
                      onChange={(e) => setSettings((prev) => ({ ...prev, end_date: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                      className="bg-obsidian border-white/[0.08] text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="prize_pool" className="text-chrome">Prize Pool Description</Label>
                  <Input
                    id="prize_pool"
                    value={settings.prize_pool}
                    onChange={(e) => setSettings((prev) => ({ ...prev, prize_pool: e.target.value }))}
                    className="bg-obsidian border-white/[0.08] text-white"
                    placeholder="$250 Prize Pool"
                  />
                </div>

                <div>
                  <Label htmlFor="minimum_signups" className="text-chrome">Minimum Signups Goal</Label>
                  <Input
                    id="minimum_signups"
                    type="number"
                    min="0"
                    value={settings.minimum_signups}
                    onChange={(e) => setSettings((prev) => ({ ...prev, minimum_signups: parseInt(e.target.value) || 0 }))}
                    className="bg-obsidian border-white/[0.08] text-white"
                    placeholder="80"
                  />
                  <p className="text-sm text-steel mt-1">Displayed as a participation goal on the Cadathon page. If more people sign up, the count adds to this number.</p>
                </div>

                <div className="border-t border-white/[0.08] pt-4">
                  <h3 className="text-lg font-semibold text-molten mb-4">Base Models & Game</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="game_description" className="text-chrome">Game Description</Label>
                      <Input
                        id="game_description"
                        value={settings.game_description}
                        onChange={(e) => setSettings((prev) => ({ ...prev, game_description: e.target.value }))}
                        className="bg-obsidian border-white/[0.08] text-white"
                        placeholder="Design a custom 3D-printable puzzle box..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="model_link_1" className="text-chrome">Base Model 1 Link (Onshape)</Label>
                      <Input
                        id="model_link_1"
                        value={settings.model_link_1}
                        onChange={(e) => setSettings((prev) => ({ ...prev, model_link_1: e.target.value }))}
                        className="bg-obsidian border-white/[0.08] text-white"
                        placeholder="https://cad.onshape.com/documents/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="model_link_2" className="text-chrome">Base Model 2 Link (Onshape)</Label>
                      <Input
                        id="model_link_2"
                        value={settings.model_link_2}
                        onChange={(e) => setSettings((prev) => ({ ...prev, model_link_2: e.target.value }))}
                        className="bg-obsidian border-white/[0.08] text-white"
                        placeholder="https://cad.onshape.com/documents/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="model_link_3" className="text-chrome">Base Model 3 Link (Onshape)</Label>
                      <Input
                        id="model_link_3"
                        value={settings.model_link_3}
                        onChange={(e) => setSettings((prev) => ({ ...prev, model_link_3: e.target.value }))}
                        className="bg-obsidian border-white/[0.08] text-white"
                        placeholder="https://cad.onshape.com/documents/..."
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full bg-molten hover:bg-molten-ember"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-obsidian border border-white/[0.06]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-molten">
                  <Megaphone className="h-5 w-5" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={newAnnouncementTitle}
                    onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                    className="bg-obsidian border-white/[0.08] text-white"
                    placeholder="Announcement title (optional)"
                  />
                  <div className="flex gap-2">
                    <textarea
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      className="flex-1 bg-obsidian border border-white/[0.08] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-molten"
                      placeholder="Announcement text..."
                      rows={2}
                    />
                    <Button
                      onClick={handleAddAnnouncement}
                      disabled={announcementLoading || !newAnnouncement.trim()}
                      className="bg-molten hover:bg-molten-ember shrink-0 self-end"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {announcements.length === 0 ? (
                  <p className="text-steel text-center py-4">No announcements yet</p>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((a) => (
                      <div key={a.id} className="bg-obsidian border border-white/[0.08] rounded-lg p-4">
                        {editingAnnouncement === a.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="bg-obsidian border-white/[0.15] text-white"
                              placeholder="Title (optional)"
                            />
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full bg-obsidian border border-white/[0.15] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-molten"
                              rows={3}
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                onClick={() => { setEditingAnnouncement(null); setEditTitle(""); setEditContent("") }}
                                variant="outline"
                                size="sm"
                                className="border-white/[0.15] text-chrome"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleUpdateAnnouncement(a.id)}
                                disabled={announcementLoading || !editContent.trim()}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              {a.title && (
                                <p className="text-molten font-semibold text-sm mb-1">{a.title}</p>
                              )}
                              <p className="text-chrome text-sm">{a.content}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                onClick={() => { setEditingAnnouncement(a.id); setEditTitle(a.title); setEditContent(a.content) }}
                                variant="outline"
                                size="sm"
                                className="border-white/[0.15] text-chrome h-8 w-8 p-0"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteAnnouncement(a.id)}
                                variant="outline"
                                size="sm"
                                className="border-red-600/50 text-red-400 h-8 w-8 p-0 hover:bg-red-900/20"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        <p className="text-steel/70 text-xs mt-2">
                          {new Date(a.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-obsidian border border-white/[0.06]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-molten">
                  <Users className="h-5 w-5" />
                  Signups
                  {signups.length > 0 && (
                    <span className="text-sm font-normal text-steel ml-2">
                      ({signups.length} total)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    setShowSignups(!showSignups)
                    if (!showSignups) fetchSignups()
                  }}
                  variant="outline"
                  className="border-white/[0.15] text-white hover:bg-white/[0.06] mb-4"
                >
                  {showSignups ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showSignups ? "Hide Signups" : "View Signups"}
                </Button>

                {showSignups && (
                  <div className="overflow-x-auto">
                    {signups.length === 0 ? (
                      <p className="text-steel text-center py-4">No signups yet</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/[0.08]">
                            <th className="text-left py-2 px-2 text-steel">Name</th>
                            <th className="text-left py-2 px-2 text-steel">Email</th>
                            <th className="text-left py-2 px-2 text-steel">Phone</th>
                            <th className="text-left py-2 px-2 text-steel">Age</th>
                            <th className="text-left py-2 px-2 text-steel">State</th>
                            <th className="text-left py-2 px-2 text-steel">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {signups.map((s) => (
                            <tr key={s.id} className="border-b border-white/[0.08] hover:bg-white/[0.06]/30">
                              <td className="py-2 px-2">{s.name}</td>
                              <td className="py-2 px-2 text-chrome">{s.email}</td>
                              <td className="py-2 px-2 text-steel">{s.phone || "-"}</td>
                              <td className="py-2 px-2 text-steel">{s.age ?? "-"}</td>
                              <td className="py-2 px-2 text-steel">{s.location_state || "-"}</td>
                              <td className="py-2 px-2 text-steel text-xs">
                                {new Date(s.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
