import { useEffect, useMemo, useState } from "react";
import { Check, Landmark, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const providerOptions = [
  { id: "kbzpay", label: "KBZ Pay", kind: "Wallet" },
  { id: "wavepay", label: "Wave Pay", kind: "Wallet" },
  { id: "ayapay", label: "AYA Pay", kind: "Wallet" },
  { id: "kbzbank", label: "KBZ Bank", kind: "Bank" },
  { id: "ayabank", label: "AYA Bank", kind: "Bank" },
  { id: "bangkok", label: "Bangkok Bank", kind: "Bank" },
  { id: "kasikorn", label: "KASIKORNBANK", kind: "Bank" },
] as const;

type ProviderId = (typeof providerOptions)[number]["id"];
type RecipientForm = {
  providerLabel: string;
  kind: "Wallet" | "Bank";
  accountName: string;
  accountIdentifier: string;
  instructions: string;
  qrUrl: string;
  isActive: boolean;
};

const blankForm = (providerId: ProviderId): RecipientForm => {
  const provider = providerOptions.find((item) => item.id === providerId) ?? providerOptions[0];
  return { providerLabel: provider.label, kind: provider.kind, accountName: "", accountIdentifier: "", instructions: "", qrUrl: "", isActive: false };
};

function StaffRecipientsContent() {
  const { user, loading } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>("kbzpay");
  const [form, setForm] = useState<RecipientForm>(() => blankForm("kbzpay"));
  const query = trpc.merchantRecipient.list.useQuery(undefined, { enabled: !loading && user?.role === "admin" });
  const saveMutation = trpc.merchantRecipient.upsert.useMutation({
    onSuccess: async () => {
      await query.refetch();
      toast("Merchant account settings saved.");
    },
    onError: (error) => toast(error.message),
  });
  const currentRecipient = useMemo(() => query.data?.find((item) => item.paymentMethod === selectedProvider), [query.data, selectedProvider]);

  useEffect(() => {
    if (currentRecipient) {
      setForm({
        providerLabel: currentRecipient.providerLabel,
        kind: currentRecipient.kind === "Bank" ? "Bank" : "Wallet",
        accountName: currentRecipient.accountName,
        accountIdentifier: currentRecipient.accountIdentifier,
        instructions: currentRecipient.instructions,
        qrUrl: currentRecipient.qrUrl || "",
        isActive: Boolean(currentRecipient.isActive),
      });
    } else {
      setForm(blankForm(selectedProvider));
    }
  }, [currentRecipient, selectedProvider]);

  if (!loading && user && user.role !== "admin") {
    return <div className="staff-access-denied"><Landmark size={28} /><p className="staff-kicker">STAFF AREA</p><h1>Staff access required.</h1><p>Only admin accounts can publish merchant destinations to applicants.</p></div>;
  }

  const updateField = <K extends keyof RecipientForm>(key: K, value: RecipientForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  const save = () => {
    if (!form.accountName.trim() || !form.accountIdentifier.trim() || form.instructions.trim().length < 10) {
      toast("Add the verified account name, destination, and clear payment instructions.");
      return;
    }
    saveMutation.mutate({ paymentMethod: selectedProvider, ...form, qrUrl: form.qrUrl.trim() });
  };

  return <div className="staff-page">
    <header className="staff-header"><div><p className="staff-kicker">OPERATIONS / MERCHANT ACCOUNTS</p><h1>Verified recipient details</h1><p className="staff-lede">Publish only destinations that your team has independently verified with the provider. Inactive entries remain private.</p></div><div className="staff-publish-state"><span className={form.isActive ? "active" : ""}><span />{form.isActive ? "Published to applicants" : "Private draft"}</span></div></header>
    <section className="recipient-workspace"><aside className="recipient-provider-list"><div className="recipient-list-heading"><p className="staff-kicker">PROVIDERS</p><span>{query.data?.filter((recipient) => Boolean(recipient.isActive)).length ?? 0} published</span></div>{providerOptions.map((provider) => { const saved = query.data?.find((item) => item.paymentMethod === provider.id); return <button type="button" key={provider.id} className={selectedProvider === provider.id ? "selected" : ""} onClick={() => setSelectedProvider(provider.id)}><span className="recipient-provider-icon"><Landmark size={15} /></span><span><strong>{provider.label}</strong><small>{provider.kind} · {saved && Boolean(saved.isActive) ? "Published" : "No public destination"}</small></span>{saved && Boolean(saved.isActive) && <Check size={15} />}</button>; })}</aside><section className="recipient-editor"><div className="recipient-editor-heading"><div><p className="staff-kicker">{form.providerLabel.toUpperCase()} / RECIPIENT PROFILE</p><h2>What should a payer see?</h2></div><ShieldCheck size={25} /></div><div className="recipient-form-grid"><label>Provider display name<input value={form.providerLabel} onChange={(event) => updateField("providerLabel", event.target.value)} /></label><label>Route type<select value={form.kind} onChange={(event) => updateField("kind", event.target.value as RecipientForm["kind"])}><option value="Wallet">Wallet</option><option value="Bank">Bank</option></select></label><label>Verified account name<input value={form.accountName} onChange={(event) => updateField("accountName", event.target.value)} placeholder="Legal merchant or account name" /></label><label>Merchant account / wallet ID<input value={form.accountIdentifier} onChange={(event) => updateField("accountIdentifier", event.target.value)} placeholder="Only the verified recipient destination" /></label><label className="recipient-form-wide">Instructions for payers<textarea value={form.instructions} onChange={(event) => updateField("instructions", event.target.value.slice(0, 2000))} placeholder="Example: Open the official Wave app, choose Send Money, and confirm this verified account name before sending MMK." maxLength={2000} /><small>{form.instructions.length}/2,000</small></label><label className="recipient-form-wide">Optional QR asset URL<input value={form.qrUrl} onChange={(event) => updateField("qrUrl", event.target.value)} placeholder="https://… or /manus-storage/verified-qr.png" /><small>Use a permanent storage URL for a QR asset only after your team verifies that it resolves to this account.</small></label></div><div className="recipient-safety-note"><ShieldCheck size={17} /><p><strong>Publish gate.</strong> Turning this on makes the exact account name, destination, instructions, and QR link visible on the payment request form. Double-check them against the provider’s onboarding confirmation first.</p></div><div className="recipient-editor-actions"><label className="recipient-toggle"><input type="checkbox" checked={form.isActive} onChange={(event) => updateField("isActive", event.target.checked)} /><span className="recipient-toggle-track" /><span>{form.isActive ? "Publish verified destination" : "Keep destination private"}</span></label><Button onClick={save} disabled={saveMutation.isPending}><Save size={15} /> {saveMutation.isPending ? "Saving…" : "Save provider details"}</Button></div></section></section>
  </div>;
}

export default function StaffRecipients() {
  return <DashboardLayout><StaffRecipientsContent /></DashboardLayout>;
}
