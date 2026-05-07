import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, TrendingUp, Eye, Zap, ArrowRight, Instagram, Facebook,
  MapPin, CheckCircle2, Play, BarChart3, Target, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Lumora — See what works in your niche" },
      { name: "description", content: "Marketing intelligence for local business. Spy on competitors, ride trends, ship better posts." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-9 rounded-2xl bg-gradient-violet shadow-pop grid place-items-center">
              <Sparkles className="size-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">Lumora</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#how" className="hover:text-foreground transition">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/app" className="text-sm font-medium hidden sm:inline">Sign in</Link>
            <Button asChild className="rounded-full bg-gradient-violet shadow-pop hover:shadow-glow transition-all">
              <Link to="/onboarding">Start free trial</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-20 grain" />
        <div className="absolute -top-20 -right-20 size-96 rounded-full bg-gradient-violet opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-gradient-lime opacity-30 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <Badge variant="outline" className="rounded-full bg-card/80 backdrop-blur border-border/60 px-4 py-1.5 mb-6">
              <Sparkles className="size-3.5 mr-1.5 text-primary" />
              Marketing intelligence, finally playful
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter text-balance leading-[0.95]">
              See what your competitors are doing{" "}
              <span className="bg-gradient-violet bg-clip-text text-transparent">right.</span>
              <br />
              Know what to post{" "}
              <span className="bg-gradient-coral bg-clip-text text-transparent">tonight.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-balance">
              Lumora watches up to 10 local competitors across Instagram, Facebook, TikTok and Google Maps —
              and tells your café, gym or studio exactly what to do next.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button size="lg" asChild className="rounded-full h-14 px-7 text-base bg-gradient-violet shadow-pop hover:shadow-glow transition-all">
                <Link to="/onboarding">
                  Start 7-day free trial <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-7 text-base border-2">
                <Play className="mr-2 size-4" /> Watch 60s demo
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-success" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-success" /> Setup in 2 min</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-success" /> 4 platforms</span>
            </div>
          </motion.div>

          {/* Floating cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid md:grid-cols-3 gap-5"
          >
            <FloatCard
              tone="lime"
              icon={<TrendingUp className="size-5" />}
              tag="Works"
              title="Behind-the-scenes Reels"
              body="Get 3.2× more engagement at competitor cafés. Try one this week."
              meta="Based on 84 posts · 6 competitors"
            />
            <FloatCard
              tone="coral"
              icon={<Zap className="size-5" />}
              tag="Avoid"
              title="8+ slide carousels"
              body="Show a 47% reach drop in your niche. Cap at 5 slides."
              meta="Based on 31 posts"
            />
            <FloatCard
              tone="violet"
              icon={<Sparkles className="size-5" />}
              tag="Trending"
              title="Latte art slow-mo audio"
              body='"Aesthetic morning" sound is up 280% this week in Lviv.'
              meta="TikTok · Instagram"
            />
          </motion.div>
        </div>
      </section>

      {/* Logos / platforms */}
      <section className="border-y border-border/50 bg-card/40">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-muted-foreground">
          <span className="text-xs uppercase tracking-widest">Connects to</span>
          <span className="flex items-center gap-2 font-medium"><Instagram className="size-4" /> Instagram</span>
          <span className="flex items-center gap-2 font-medium"><Facebook className="size-4" /> Facebook</span>
          <span className="flex items-center gap-2 font-medium">
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            TikTok
          </span>
          <span className="flex items-center gap-2 font-medium"><MapPin className="size-4" /> Google Maps</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="secondary" className="rounded-full mb-4">Features</Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Three views. One unfair advantage.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every screen in Lumora ends in a concrete next step — never a data graveyard.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            gradient="bg-gradient-violet"
            icon={<Eye className="size-6" />}
            title="Competitor Radar"
            body="Track up to 10 rivals. Posting cadence, hashtag strategy, top posts, review sentiment — side by side."
          />
          <FeatureCard
            gradient="bg-gradient-lime"
            icon={<TrendingUp className="size-6" />}
            title="Trend Tracker"
            body="Audios, hashtags, formats and seasonal hooks bubbling up in your local niche, before they peak."
          />
          <FeatureCard
            gradient="bg-gradient-coral"
            icon={<BarChart3 className="size-6" />}
            title="My Performance"
            body="Connect your accounts. Lumora correlates what you post with how it performs — and proves the lift."
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-muted/40 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="rounded-full mb-4">How it works</Badge>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">From signup to insight in 2 minutes.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Step n="01" tone="lime" icon={<Target className="size-5" />} title="Tell us about you" body="Name, location, your IG handle. We auto-detect your niche." />
            <Step n="02" tone="violet" icon={<Eye className="size-5" />} title="Pick competitors" body="AI suggests 5–8. Approve, swap, or add up to 10 manually." />
            <Step n="03" tone="coral" icon={<Rocket className="size-5" />} title="Get insights" body="Apify + n8n scrape. Claude synthesizes. You get a daily action card." />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="secondary" className="rounded-full mb-4">Pricing</Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Start free. Upgrade when you're hooked.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <PriceCard tier="Trial" price="Free" period="for 7 days" features={["3 competitors", "All 4 platforms", "Daily updates", "Insights feed"]} cta="Start trial" />
          <PriceCard
            tier="Starter" price="€39" period="/ month"
            features={["5 competitors", "Connect own accounts", "Performance tracking", "Weekly AI report"]}
            cta="Choose Starter"
            highlighted
          />
          <PriceCard tier="Pro" price="€89" period="/ month" features={["10 competitors", "Trend Tracker + audios", "Side-by-side compare", "PDF exports"]} cta="Go Pro" />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">UA market pricing adjusted ~35% lower at checkout.</p>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-violet p-12 md:p-20 text-primary-foreground shadow-glow">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-white/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Stop guessing what to post.</h2>
            <p className="mt-4 text-lg text-white/85">Your competitors are already publishing tonight. So should you — but smarter.</p>
            <Button size="lg" asChild className="mt-8 rounded-full h-14 px-7 bg-background text-foreground hover:bg-background/90">
              <Link to="/onboarding">Start free trial <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© 2026 Lumora — Prototype</span>
          <span>Built with Apify · n8n · Claude</span>
        </div>
      </footer>
    </div>
  );
}

function FloatCard({ tone, icon, tag, title, body, meta }: { tone: "lime" | "coral" | "violet"; icon: React.ReactNode; tag: string; title: string; body: string; meta: string }) {
  const toneMap = {
    lime: "bg-gradient-lime text-foreground",
    coral: "bg-gradient-coral text-white",
    violet: "bg-gradient-violet text-white",
  };
  return (
    <motion.div whileHover={{ y: -6 }} className="rounded-3xl bg-card border border-border/60 shadow-soft p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className={`size-10 rounded-2xl grid place-items-center ${toneMap[tone]} shadow-pop`}>{icon}</div>
        <Badge variant="outline" className="rounded-full uppercase text-[10px] tracking-wider">{tag}</Badge>
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <p className="mt-4 text-xs text-muted-foreground/80">{meta}</p>
    </motion.div>
  );
}

function FeatureCard({ gradient, icon, title, body }: { gradient: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="group rounded-3xl bg-card border border-border/60 p-8 shadow-soft hover:shadow-pop transition-all">
      <div className={`size-14 rounded-2xl grid place-items-center text-white shadow-pop ${gradient} mb-5`}>{icon}</div>
      <h3 className="font-display text-2xl font-bold">{title}</h3>
      <p className="mt-3 text-muted-foreground">{body}</p>
    </motion.div>
  );
}

function Step({ n, tone, icon, title, body }: { n: string; tone: "lime" | "coral" | "violet"; icon: React.ReactNode; title: string; body: string }) {
  const toneMap = { lime: "bg-gradient-lime", coral: "bg-gradient-coral", violet: "bg-gradient-violet" };
  return (
    <div className="rounded-3xl bg-card border border-border/60 p-8 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <span className="font-display text-3xl font-bold text-muted-foreground/40">{n}</span>
        <div className={`size-10 rounded-2xl grid place-items-center text-white shadow-pop ${toneMap[tone]}`}>{icon}</div>
      </div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground text-sm">{body}</p>
    </div>
  );
}

function PriceCard({ tier, price, period, features, cta, highlighted }: { tier: string; price: string; period: string; features: string[]; cta: string; highlighted?: boolean }) {
  return (
    <div className={`relative rounded-3xl p-8 border shadow-soft ${highlighted ? "bg-gradient-violet text-primary-foreground border-transparent shadow-glow scale-[1.02]" : "bg-card border-border/60"}`}>
      {highlighted && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-background text-foreground border">Most popular</Badge>}
      <h3 className="font-display text-lg font-semibold opacity-80">{tier}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-5xl font-bold tracking-tight">{price}</span>
        <span className="opacity-70 text-sm">{period}</span>
      </div>
      <ul className="mt-6 space-y-2.5">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className={`size-4 mt-0.5 ${highlighted ? "text-white" : "text-success"}`} />
            <span className={highlighted ? "text-white/90" : ""}>{f}</span>
          </li>
        ))}
      </ul>
      <Button asChild className={`mt-8 w-full rounded-full h-12 ${highlighted ? "bg-background text-foreground hover:bg-background/90" : ""}`}>
        <Link to="/onboarding">{cta}</Link>
      </Button>
    </div>
  );
}
