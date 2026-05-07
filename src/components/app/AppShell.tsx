import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Sparkles, LayoutDashboard, Eye, Lightbulb, TrendingUp, BarChart3, Settings, Bell, Search, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/competitors", label: "Competitor Radar", icon: Eye },
  { to: "/app/insights", label: "Insights Feed", icon: Lightbulb },
  { to: "/app/trends", label: "Trend Tracker", icon: TrendingUp },
  { to: "/app/performance", label: "My Performance", icon: BarChart3 },
];

export function AppShell() {
  const loc = useLocation();
  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border/60 bg-sidebar p-4 flex flex-col sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="size-9 rounded-2xl bg-gradient-violet shadow-pop grid place-items-center">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">FlyHigh</span>
        </Link>

        <nav className="mt-6 space-y-1">
          {nav.map(item => {
            const active = item.end ? loc.pathname === item.to : loc.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active ? "bg-gradient-violet text-primary-foreground shadow-pop" : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="size-4" /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-2xl bg-gradient-sunset p-4 text-white shadow-pop">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="size-4" />
              <span className="font-semibold text-sm">Trial · 5 days left</span>
            </div>
            <p className="text-xs text-white/85 mb-3">Unlock weekly AI reports, performance tracking and 10 competitors.</p>
            <Button size="sm" className="w-full rounded-full bg-background text-foreground hover:bg-background/90">Upgrade</Button>
          </div>

          <div className="flex items-center gap-3 px-2 py-2">
            <div className="size-9 rounded-full bg-gradient-lime grid place-items-center font-bold text-sm">O</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Olena K.</div>
              <div className="text-xs text-muted-foreground truncate">Café Svitlo · Lviv</div>
            </div>
            <Settings className="size-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/60">
          <div className="flex items-center gap-4 px-8 py-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search competitors, insights, hashtags..." className="pl-10 h-10 rounded-full bg-muted/50 border-border/60" />
            </div>
            <Button variant="outline" size="icon" className="rounded-full">
              <Bell className="size-4" />
            </Button>
            <Badge variant="outline" className="rounded-full">Live · synced 4m ago</Badge>
          </div>
        </header>
        <div className="px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
