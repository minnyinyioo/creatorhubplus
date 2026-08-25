import { Save, Settings2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export default function ProjectSettings() {
  const settingsQuery = trpc.workspaceSettings.get.useQuery();
  const utils = trpc.useUtils();
  const [studioName, setStudioName] = useState("");
  const [focusLengthMinutes, setFocusLengthMinutes] = useState("50");
  const updateSettings = trpc.workspaceSettings.update.useMutation({ onSuccess: async () => { await utils.workspaceSettings.get.invalidate(); toast.success("Project settings saved."); }, onError: (error) => toast.error(error.message) });

  useEffect(() => {
    if (!settingsQuery.data) return;
    setStudioName(settingsQuery.data.studioName);
    setFocusLengthMinutes(String(settingsQuery.data.focusLengthMinutes));
  }, [settingsQuery.data]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = studioName.trim();
    const focus = Number(focusLengthMinutes);
    if (name.length < 2) return toast.error("Studio name must be at least two characters.");
    if (!Number.isInteger(focus) || focus < 5 || focus > 180) return toast.error("Focus length must be between 5 and 180 minutes.");
    updateSettings.mutate({ studioName: name, focusLengthMinutes: focus });
  };

  return <DashboardLayout><section className="companion-page settings-page">
    <div className="companion-page-top"><span>PROJECT / SETTINGS</span><span className="settings-saved">Private to your studio</span></div>
    <div className="companion-heading"><div><p className="app-kicker">MAKE THE SPACE YOURS</p><h1>Set the tone<br />for the work.</h1><p>These preferences shape your personal Workspace without changing the public CreatorHubPlus site.</p></div><Settings2 size={42} strokeWidth={1.2} /></div>
    <form className="settings-form" onSubmit={submit}><label><span>Studio name</span><input value={studioName} onChange={(event) => setStudioName(event.target.value)} placeholder="My studio" maxLength={120} /></label><label><span>Default focus session</span><select value={focusLengthMinutes} onChange={(event) => setFocusLengthMinutes(event.target.value)}><option value="25">25 minutes</option><option value="50">50 minutes</option><option value="75">75 minutes</option><option value="90">90 minutes</option></select></label><div className="settings-note"><strong>What is saved</strong><p>Your studio name and focus preference are stored for your account. They are not shared with other users.</p></div><button className="companion-primary" type="submit" disabled={updateSettings.isPending}><Save size={15} /> {updateSettings.isPending ? "Saving…" : "Save settings"}</button></form>
  </section></DashboardLayout>;
}
