import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Droplets, LayoutDashboard, TestTube2, History, Settings, LogOut, Sliders } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/sources", label: "Water Sources", icon: Droplets },
  { href: "/dashboard/tests/new", label: "New Analysis", icon: TestTube2 },
  { href: "/dashboard/simulator", label: "Treatment Simulator", icon: Sliders },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch profile for display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle()

  const displayName = (profile as { display_name?: string | null } | null)?.display_name ?? user.email ?? "User"

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-sky-50/70 via-slate-50 to-blue-50/40 text-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-sm shadow-sky-500/20">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 block">
              AquaVeris
            </span>
          </div>
        </div>
        <Separator className="bg-slate-100 dark:bg-slate-800" />

        {/* Nav */}
        <nav className="flex-1 p-3.5 space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-sky-700 hover:bg-sky-50/90 active:bg-sky-100 transition-all dark:text-slate-400 dark:hover:text-sky-300 dark:hover:bg-sky-950/60"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <Separator className="bg-slate-100 dark:bg-slate-800" />

        {/* User + Logout */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sky-50/50 border border-sky-100/60 dark:bg-slate-800/50 dark:border-slate-800">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-500 text-white flex items-center justify-center shadow-xs">
              <span className="text-xs font-bold">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate dark:text-slate-100">{displayName}</p>
              <p className="text-xs text-slate-500 truncate dark:text-slate-400">{user.email}</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="post">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50/80 rounded-xl dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile header */}
        <header className="md:hidden border-b border-slate-200/80 px-4 h-14 flex items-center justify-between bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-xs">
              <Droplets className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm">AquaVeris</span>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">{children}</div>
      </main>
    </div>
  )
}
