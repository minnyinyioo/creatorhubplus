import { useEffect, useState } from "react";
import { Check, DollarSign, Save } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function StaffPricing() {
  const catalog = trpc.paymentCatalog.list.useQuery();
  const [values, setValues] = useState<Record<string, string>>({});
  const [labels, setLabels] = useState<Record<string, string>>({});
  const utils = trpc.useUtils();
  const update = trpc.paymentCatalog.updatePrice.useMutation({ onSuccess: () => { toast.success("Service price updated."); void utils.paymentCatalog.list.invalidate(); } });
  useEffect(() => {
    if (!catalog.data) return;
    setValues(Object.fromEntries(catalog.data.map((item) => [item.serviceKey, item.priceMmk == null ? "" : String(item.priceMmk)])));
    setLabels(Object.fromEntries(catalog.data.map((item) => [item.serviceKey, item.priceLabel])));
  }, [catalog.data]);

  return <DashboardLayout><div className="companion-page pricing-page"><header className="companion-header"><div><span className="companion-kicker">STAFF CONFIGURATION</span><h1>Price the service<br /><em>at the source.</em></h1><p>These values are read by the payment validator. A blank amount means the request requires a quote and keeps the selectable amount presets.</p></div></header><section className="pricing-list">{catalog.isLoading ? <p className="companion-empty">Loading service configuration…</p> : catalog.data?.map((item) => <article className="pricing-card" key={item.serviceKey}><div className="pricing-card-icon"><DollarSign size={18} /></div><div className="pricing-card-copy"><span>{item.serviceKey}</span><h2>{item.serviceLabel}</h2><p>Published label: {item.priceLabel}</p></div><div className="pricing-card-fields"><label>Price (MMK)<Input inputMode="numeric" value={values[item.serviceKey] ?? ""} placeholder="Quote required" onChange={(event) => setValues((current) => ({ ...current, [item.serviceKey]: event.target.value.replace(/\D/g, "") }))} /></label><label>Display label<Input value={labels[item.serviceKey] ?? ""} onChange={(event) => setLabels((current) => ({ ...current, [item.serviceKey]: event.target.value.slice(0, 120) }))} /></label><Button disabled={update.isPending} onClick={() => update.mutate({ serviceKey: item.serviceKey as "platform_earnings" | "payout_receiving" | "account_setup" | "address_support", priceMmk: values[item.serviceKey] ? Number(values[item.serviceKey]) : null, priceLabel: labels[item.serviceKey] || undefined })}><Save size={15} /> Save</Button></div>{update.data?.serviceKey === item.serviceKey && <small className="pricing-saved"><Check size={13} /> Saved to server configuration</small>}</article>)}</section></div></DashboardLayout>;
}
