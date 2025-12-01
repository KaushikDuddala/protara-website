import Navigation from "../components/navigation"

/** Admin layout - wraps admin pages with the site navigation. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-void text-white">
      <Navigation />
      {children}
    </div>
  )
}