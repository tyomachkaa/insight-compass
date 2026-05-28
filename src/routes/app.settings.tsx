import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, Trash2, Plus, Loader2, Instagram, Building2, Globe, CreditCard, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentWorkspace } from "@/lib/queries/workspace";
import {
  useAddAccount, useManualRefresh, useRemoveAccount, useSocialAccounts, useUpdateNotifications,
} from "@/lib/queries/actions";
import { NoWorkspaceState } from "@/components/app/PageState";
import type { Platform } from "@/lib/queries/onboarding";

export const Route = createFileRoute("/app/settings")({ component: SettingsPage });

const PLATFORMS: Platform[] = ["instagram", "tiktok", "youtube", "threads", "twitter", "facebook"];

function SettingsPage() {
  const { workspace, workspaceId, roleKey } = useCurrentWorkspace();
  const { own, competitors, isLoading } = useSocialAccounts();
  const refresh = useManualRefresh();
  const removeAccount = useRemoveAccount();
  const addAccount = useAddAccount();
  const updateNotifications = useUpdateNotifications();

  const [newPlatform, setNewPlatform] = useState<Platform>("instagram");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState<"own" | "competitor">("competitor");

  const [notif, setNotif] = useState({
    email_enabled: true,
    notify_when_analysis_ready: true,
    notify_about_high_priority_insights: true,
    notify_about_competitor_moves: true,
  });

  if (!workspaceId) return <NoWorkspaceState />;

  const toggleNotif = (key: keyof typeof notif) => {
    const nextVal = !notif[key];
    setNotif((p) => ({ ...p, [key]: nextVal }));
    updateNotifications.mutate({ [key]: nextVal });
  };

  const onAdd = () => {
    if (!newUrl.trim()) return;
    addAccount.mutate(
      { platform: newPlatform, profile_url: newUrl.trim(), account_type: newType },
      { onSuccess: () => setNewUrl("") },
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Workspace, accounts, and notifications. Viewing as <span className="text-primary font-medium capitalize">{roleKey}</span>.</p>
        </div>
        <Button
          className="rounded-full bg-primary text-primary-foreground shadow-glow hover:opacity-90"
          disabled={refresh.isPending}
          onClick={() => refresh.mutate()}
        >
          {refresh.isPending ? <><Loader2 className="size-4 mr-1.5 animate-spin" /> Refreshing…</> : <><RefreshCw className="size-4 mr-1.5" /> Refresh analysis</>}
        </Button>
      </div>

      {refresh.isSuccess && (
        <div className="rounded-2xl border border-success/40 bg-success/10 p-4 text-sm">Refresh started — new insights will appear once the run finishes.</div>
      )}
      {refresh.isError && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{(refresh.error as Error)?.message}</div>
      )}

      {/* Workspace */}
      <Section icon={<Building2 className="size-5" />} title="Workspace">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Project" value={workspace?.project_name} />
          <Field label="Niche" value={workspace?.niche} />
          <Field label="Country" value={workspace?.country} />
          <Field label="Timezone" value={workspace?.timezone} />
          <Field label="Report language" value={workspace?.report_language} />
          <Field label="Plan" value={workspace?.plan_id} icon={<CreditCard className="size-3.5" />} />
        </div>
      </Section>

      {/* Accounts */}
      <Section icon={<Instagram className="size-5" />} title="Connected accounts">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading accounts…</p>
        ) : (
          <div className="space-y-4">
            <AccountGroup label="Your accounts" rows={own} onRemove={(id) => removeAccount.mutate({ account_id: id })} removing={removeAccount.isPending} />
            <AccountGroup label="Competitors" rows={competitors} onRemove={(id) => removeAccount.mutate({ account_id: id })} removing={removeAccount.isPending} />

            <div className="rounded-2xl border border-border/60 p-4 space-y-3">
              <div className="text-sm font-medium">Add an account</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={newType} onValueChange={(v) => setNewType(v as "own" | "competitor")}>
                  <SelectTrigger className="sm:w-36 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="own">Your account</SelectItem>
                    <SelectItem value="competitor">Competitor</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newPlatform} onValueChange={(v) => setNewPlatform(v as Platform)}>
                  <SelectTrigger className="sm:w-36 rounded-xl capitalize"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://instagram.com/handle" className="flex-1 rounded-xl" />
                <Button onClick={onAdd} disabled={addAccount.isPending || !newUrl.trim()} className="rounded-xl">
                  {addAccount.isPending ? <Loader2 className="size-4 animate-spin" /> : <><Plus className="size-4 mr-1" /> Add</>}
                </Button>
              </div>
              {addAccount.isError && <p className="text-xs text-destructive">{(addAccount.error as Error)?.message}</p>}
            </div>
          </div>
        )}
      </Section>

      {/* Notifications */}
      <Section icon={<Bell className="size-5" />} title="Notifications">
        <div className="space-y-1">
          <Toggle label="Email notifications" checked={notif.email_enabled} onChange={() => toggleNotif("email_enabled")} />
          <Toggle label="When analysis is ready" checked={notif.notify_when_analysis_ready} onChange={() => toggleNotif("notify_when_analysis_ready")} />
          <Toggle label="High-priority insights" checked={notif.notify_about_high_priority_insights} onChange={() => toggleNotif("notify_about_high_priority_insights")} />
          <Toggle label="New competitor moves" checked={notif.notify_about_competitor_moves} onChange={() => toggleNotif("notify_about_competitor_moves")} />
        </div>
        {updateNotifications.isError && <p className="mt-2 text-xs text-destructive">{(updateNotifications.error as Error)?.message}</p>}
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-card/60 border border-border/60 p-6 shadow-pop">
      <div className="flex items-center gap-3 mb-5">
        <div className="size-10 rounded-2xl bg-primary/15 text-primary border border-primary/30 grid place-items-center">{icon}</div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">{icon} {label}</div>
      <div className="font-medium">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

function AccountGroup({
  label, rows, onRemove, removing,
}: {
  label: string;
  rows: { account_id: string; platform: string; username: string | null; display_name: string | null; profile_url: string; status: string }[];
  onRemove: (id: string) => void;
  removing: boolean;
}) {
  return (
    <div>
      <div className="text-sm font-medium mb-2 flex items-center gap-2"><Globe className="size-4 text-muted-foreground" /> {label} <Badge variant="outline" className="rounded-full">{rows.length}</Badge></div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">None yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((a) => (
            <div key={a.account_id} className="flex items-center gap-3 rounded-2xl border border-border/60 p-3">
              <div className="size-9 rounded-xl bg-gradient-to-br from-primary/30 via-primary/15 to-violet/30 border border-primary/40 grid place-items-center text-sm capitalize shrink-0">{a.platform.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{a.display_name ?? a.username ?? a.profile_url}</div>
                <div className="text-xs text-muted-foreground truncate capitalize">{a.platform} · {a.status}</div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive" disabled={removing} onClick={() => onRemove(a.account_id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0 cursor-pointer">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
