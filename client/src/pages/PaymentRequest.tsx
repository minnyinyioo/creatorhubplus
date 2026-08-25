/**
 * CreatorHubPlus — Payment Request
 * Product direction: a sober, step-by-step payment record; no card data, PINs or credentials are ever requested.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, FileUp, Landmark, LockKeyhole, ShieldCheck, Upload, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const methods = [
  { id: "kbzpay", label: "KBZ Pay", kind: "Wallet", logo: "/manus-storage/kbzpay_b6275ce0.webp" },
  { id: "wavepay", label: "Wave Pay", kind: "Wallet", logo: "/manus-storage/wavepay-appicon_9c7e244e.jpg" },
  { id: "ayapay", label: "AYA Pay", kind: "Wallet", logo: "/manus-storage/ayapay_385dc148.png" },
  { id: "kbzbank", label: "KBZ Bank", kind: "Bank", logo: "/manus-storage/kbzbank_ccd3a1fa.png" },
  { id: "ayabank", label: "AYA Bank", kind: "Bank", logo: "/manus-storage/ayabank_d9d29f1d.png" },
  { id: "bangkok", label: "Bangkok Bank", kind: "Bank", logo: "/manus-storage/bangkokbank-official_ebc198ff.svg" },
  { id: "kasikorn", label: "KASIKORNBANK", kind: "Bank", logo: "/manus-storage/kasikornbank-official_5108252c.png" },
] as const;

const amountChoices = [50000, 100000, 250000];
const allowedReceiptTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const maxReceiptBytes = 10 * 1024 * 1024;

export default function PaymentRequest() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<(typeof methods)[number]["id"]>("kbzpay");
  const [amount, setAmount] = useState("");
  const [payerName, setPayerName] = useState("");
  const [accountHint, setAccountHint] = useState("");
  const [reference, setReference] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [step, setStep] = useState<"details" | "proof">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selected = methods.find((method) => method.id === selectedMethod) ?? methods[0];
  const recipientInput = useMemo(() => ({ paymentMethod: selected.id }), [selected.id]);
  const recipientQuery = trpc.paymentRequest.recipient.useQuery(recipientInput);
  const recipient = recipientQuery.data;
  const utils = trpc.useUtils();
  const myRequests = trpc.paymentRequest.listMine.useQuery(undefined, { enabled: !loading && isAuthenticated });

  const beginProofStep = () => {
    if (!payerName.trim() || !amount || Number(amount) <= 0) {
      toast("Add your name and a valid amount before continuing.");
      return;
    }
    setStep("proof");
  };

  const submitProof = async () => {
    if (!isAuthenticated) {
      toast("Sign in before submitting your payment proof.");
      startLogin();
      return;
    }
    if (!proof) {
      toast("Choose a receipt image or PDF before submitting.");
      return;
    }
    if (proof.size > maxReceiptBytes) {
      toast("Receipt files must be no larger than 10 MB.");
      return;
    }
    if (!allowedReceiptTypes.includes(proof.type)) {
      toast("Use a PNG, JPG, WEBP or PDF receipt file.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("paymentMethod", selected.id);
      formData.append("payerName", payerName.trim());
      formData.append("accountHint", accountHint);
      formData.append("amountMmk", String(Number(amount)));
      formData.append("paymentReference", reference.trim());
      formData.append("receipt", proof, proof.name);

      const response = await fetch("/api/payment-requests/receipt", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const payload = await response.json().catch(() => ({})) as { requestCode?: string; message?: string };
      if (!response.ok) throw new Error(payload.message || "Unable to save this payment request.");

      await utils.paymentRequest.listMine.invalidate();
      toast(`Payment request ${payload.requestCode ?? ""} was submitted for review.`);
      setProof(null);
      setReference("");
      setStep("details");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to prepare the receipt file.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <main className="payment-page">
    <header className="payment-header"><Link href="/" className="payment-brand"><img src="/favicon.svg" alt="CreatorHubPlus logo" /><span>creatorhub<span>plus</span></span></Link><Link href="/" className="payment-return"><ArrowLeft size={15} /> Return to site</Link></header>
    <section className="payment-hero"><div><p className="payment-eyebrow"><WalletCards size={14} /> PAYMENT REQUEST</p><h1>Choose a route.<br /><em>Keep a clear record.</em></h1></div><p>Use this form to record a planned payment. Never enter a password, PIN, card number, CVV or wallet credential.</p></section>
    <section className="payment-shell">
      <aside className="payment-steps"><p>PAYMENT PATH</p><ol><li className="active"><span>01</span> Choose method</li><li className={step === "proof" ? "active" : ""}><span>02</span> Add payment details</li><li className={step === "proof" ? "active" : ""}><span>03</span> Upload proof</li></ol><div><ShieldCheck size={17} /><p>Your request remains <strong>pending review</strong> until verified through an approved channel.</p></div></aside>
      <div className="payment-workspace">
        <section className="method-stage">
          <div className="payment-section-heading"><div><p>01 / SELECT A METHOD</p><h2>How will you make<br />the payment?</h2></div><span>Choose one route</span></div>
          <label className="method-select"><span>Payment method</span><select value={selectedMethod} onChange={(event) => setSelectedMethod(event.target.value as typeof selectedMethod)}>{methods.map((method) => <option key={method.id} value={method.id}>{method.label} · {method.kind}</option>)}</select></label>
          <div className={`selected-method-note${recipient ? " is-verified" : ""}`}><img src={selected.logo} alt="" /><div><p>{recipientQuery.isLoading ? "CHECKING PUBLISHED DESTINATION" : recipientQuery.error ? "DESTINATION LOOKUP UNAVAILABLE" : recipient ? "VERIFIED MERCHANT ACCOUNT" : "RECIPIENT NOT YET PUBLISHED"}</p><strong>{recipientQuery.isLoading ? "Loading verified details…" : recipientQuery.error ? "Try again shortly" : recipient ? recipient.accountName : "Provider onboarding in progress"}</strong>{recipientQuery.error ? <span>We could not load the published recipient details. Do not send funds until the verified destination is visible again.</span> : recipient ? <><b>{recipient.accountIdentifier}</b><span>{recipient.instructions}</span>{recipient.qrUrl && <a className="recipient-qr-link" href={recipient.qrUrl} target="_blank" rel="noreferrer"><img src={recipient.qrUrl} alt={`${recipient.providerLabel} payment QR`} />Open verified QR asset</a>}</> : <span>Official account instructions will appear here after staff verify the merchant account and publish the provider details.</span>}</div><CheckCircle2 size={20} /></div>
        </section>
        {step === "details" ? <section className="payment-details"><div className="payment-section-heading"><div><p>02 / PAYMENT DETAILS</p><h2>Record only what<br />is needed.</h2></div><span>MMK only</span></div><div className="payment-form-grid"><label>Full name<input value={payerName} onChange={(event) => setPayerName(event.target.value)} placeholder="Name of the payer" autoComplete="name" /></label><label>Account reference <small>Last 4 digits only</small><input value={accountHint} onChange={(event) => setAccountHint(event.target.value.replace(/[^0-9A-Za-z]/g, "").slice(-8))} placeholder="e.g. 4821" maxLength={8} /></label><label className="form-wide">Amount (MMK)<input inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))} placeholder="0" /></label><div className="amount-choices">{amountChoices.map((choice) => <button type="button" key={choice} className={Number(amount) === choice ? "selected" : ""} onClick={() => setAmount(String(choice))}>{choice.toLocaleString()} MMK</button>)}</div><label className="form-wide">Payment reference <small>Optional</small><input value={reference} onChange={(event) => setReference(event.target.value.slice(0, 100))} placeholder="Transaction reference or note" /></label></div><div className="payment-warning"><CircleAlert size={17} /><p>Do not provide a password, PIN, full bank number, card number, CVV or wallet login credential. Use the official payment app or bank channel to make a payment.</p></div><button className="payment-primary" disabled={loading} onClick={beginProofStep}>Continue to proof <ArrowRight size={17} /></button></section> : <section className="payment-proof"><div className="payment-section-heading"><div><p>03 / UPLOAD PROOF</p><h2>Attach the receipt<br />after payment.</h2></div><button className="back-step" onClick={() => setStep("details")}>Edit details</button></div><label className={`proof-dropzone${proof ? " has-file" : ""}`}><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => setProof(event.target.files?.[0] ?? null)} /><Upload size={23} /><strong>{proof ? proof.name : "Choose receipt image or PDF"}</strong><span>{proof ? `${Math.ceil(proof.size / 1024)} KB selected` : "PNG, JPG, WEBP or PDF · maximum 10 MB"}</span></label><div className="proof-summary"><span>Route <b>{selected.label}</b></span><span>Amount <b>{Number(amount || 0).toLocaleString()} MMK</b></span><span>Payer <b>{payerName || "—"}</b></span></div><button className="payment-primary" disabled={isSubmitting} onClick={submitProof}><FileUp size={17} /> {isSubmitting ? "Uploading securely…" : "Submit proof for review"}</button></section>}
        {isAuthenticated && <section className="payment-history"><p>RECENT REQUESTS</p>{myRequests.isLoading ? <span>Loading your payment records…</span> : myRequests.data?.length ? <ul>{myRequests.data.map((request) => <li key={request.requestCode}><span>{request.requestCode}</span><b>{request.amountMmk.toLocaleString()} MMK</b><i>{request.status.replaceAll("_", " ")}</i>{request.reviewNote && <small>{request.reviewNote}</small>}</li>)}</ul> : <span>No payment requests have been submitted from this account.</span>}</section>}
      </div>
    </section>
    <footer className="payment-footer"><Landmark size={17} /><p>Merchant instructions are published only after a provider account and any QR asset have been verified by CreatorHubPlus staff.</p></footer>
  </main>;
}
