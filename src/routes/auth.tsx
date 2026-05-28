import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in · FlyHigh" }] }),
});

function AuthPage() {
  const { session, loading, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Once a session exists (e.g. after clicking the magic link), go to the app.
  useEffect(() => {
    if (!loading && session) navigate({ to: "/app" });
  }, [loading, session, navigate]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const submit = async () => {
    if (!emailValid) return;
    setSubmitting(true);
    setError(null);
    const { error } = await signInWithEmail(email);
    setSubmitting(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden grid place-items-center">
      <div className="absolute -top-40 -right-40 size-[500px] rounded-full bg-gradient-violet opacity-20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 size-[500px] rounded-full bg-gradient-lime opacity-20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md mx-auto px-6"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="size-10 rounded-2xl bg-gradient-violet shadow-pop grid place-items-center">
            <Sparkles className="size-6 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold">FlyHigh</span>
        </Link>

        <div className="rounded-3xl bg-card/70 backdrop-blur-sm border border-border/60 p-8 shadow-pop">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="size-14 rounded-2xl bg-success/20 border border-success/40 mx-auto grid place-items-center">
                <CheckCircle2 className="size-7 text-success" />
              </div>
              <h1 className="font-display text-2xl font-bold">Check your inbox</h1>
              <p className="text-sm text-muted-foreground">
                We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>. Open it on this device to continue.
              </p>
              <Button variant="ghost" className="rounded-full" onClick={() => { setSent(false); setEmail(""); }}>
                Use a different email
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold">Sign in to FlyHigh</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we'll send you a magic link — no password needed.
              </p>

              <div className="mt-6 space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="you@company.com"
                    type="email"
                    autoFocus
                    className="h-12 rounded-xl pl-11"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 flex items-start gap-2 text-sm">
                    <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{error}</span>
                  </div>
                )}

                <Button
                  onClick={submit}
                  disabled={!emailValid || submitting}
                  className="w-full h-12 rounded-xl bg-gradient-violet shadow-pop hover:shadow-glow"
                >
                  {submitting ? <><Loader2 className="size-4 mr-1.5 animate-spin" /> Sending…</> : <>Send magic link <ArrowRight className="size-4 ml-1.5" /></>}
                </Button>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                New here?{" "}
                <Link to="/onboarding" className="text-primary font-medium hover:underline">
                  Set up your workspace
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
