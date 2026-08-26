/**
 * CreatorHubPlus — Payment Request
 * Product direction: service-first checkout, a sober payment record, and no card data, PINs or credentials.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, FileUp, Landmark, ShieldCheck, Upload, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const services = [
  { id: "platform_earnings", label: "Platform earnings", eyebrow: "Monetisation readiness", description: "Clarify earning requirements, account status and the next useful action." },
  { id: "payout_receiving", label: "Payout & receiving", eyebrow: "Payout paths & withdrawals", description: "Map the receiving route and the details that must match before payment." },
  { id: "account_setup", label: "Account setup", eyebrow: "Setup & issue checks", description: "Use a focused checklist for new account setup and legitimate issue investigation." },
  { id: "address_support", label: "Address support", eyebrow: "Verified address preparation", description: "Understand address requirements and prepare a truthful, verifiable path." },
] as const;

type ServiceKey = (typeof services)[number]["id"];

const methods = [
  { id: "kbzpay", label: "KBZ Pay", kind: "Wallet", logo: "/manus-storage/kbzpay_b6275ce0.webp" },
  { id: "wavepay", label: "Wave Pay", kind: "Wallet", logo: "/manus-storage/wavepay-appicon_9c7e244e.jpg" },
  { id: "ayapay", label: "AYA Pay", kind: "Wallet", logo: "/manus-storage/ayapay_385dc148.png" },
  { id: "kbzbank", label: "KBZ Bank", kind: "Bank", logo: "/manus-storage/kbzbank_ccd3a1fa.png" },
  { id: "ayabank", label: "AYA Bank", kind: "Bank", logo: "/manus-storage/ayabank_d9d29f1d.png" },
  { id: "bangkok", label: "Bangkok Bank", kind: "Bank", logo: "/manus-storage/bangkok-bank-blue-wide_277247ab.png" },
  { id: "kasikorn", label: "KASIKORNBANK", kind: "Bank", logo: "/manus-storage/kasikornbank-official_5108252c.png" },
] as const;

const amountChoices = [50000, 100000, 250000];
const allowedReceiptTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const maxReceiptBytes = 10 * 1024 * 1024;

export function getInitialServiceKey(search: string): ServiceKey | null {
  const candidate = new URLSearchParams(search).get("service");
  return services.some((service) => service.id === candidate) ? candidate as ServiceKey : null;
}

function initialServiceKey(): ServiceKey | null {
  if (typeof window === "undefined") return null;
  return getInitialServiceKey(window.location.search);
}

function requestStatusCopy(status: string) {
  if (status === "verified") return { label: "Verified", next: "Payment verified. Continue with the service path shown in your case." };
  if (status === "clarification_requested") return { label: "Needs your reply", next: "Review the note from staff and submit the missing clarification." };
  if (status === "rejected") return { label: "Not approved", next: "Read the review note before starting a new, corrected request." };
  return { label: "Pending review", next: "Staff will compare the receipt with the approved merchant destination." };
}

export default function PaymentRequest() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedServiceKey, setSelectedServiceKey] = useState<ServiceKey | null>(initialServiceKey);
  const [selectedMethod, setSelectedMethod] = useState<(typeof methods)[number]["id"]>("kbzpay");
  const [amount, setAmount] = useState("");
  const [payerName, setPayerName] = useState("");
  const [accountHint, setAccountHint] = useState("");
  const [reference, setReference] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [step, setStep] = useState<"details" | "proof">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedService = services.find((service) => service.id === selectedServiceKey) ?? null;
  const selected = methods.find((method) => method.id === selectedMethod) ?? methods[0];
  const catalogQuery = trpc.paymentCatalog.list.useQuery();
  const selectedPrice = catalogQuery.data?.find((item) => item.serviceKey === selectedServiceKey) ?? null;
  useEffect(() => {
    if (selectedPrice?.priceMmk !== null && selectedPrice?.priceMmk !== undefined) setAmount(String(selectedPrice.priceMmk));
  }, [selectedPrice?.priceMmk]);
  const recipientInput = useMemo(() => ({ paymentMethod: selected.id }), [selected.id]);
  const recipientQuery = trpc.paymentRequest.recipient.useQuery(recipientInput, { enabled: Boolean(selectedServiceKey) });
  const recipient = recipientQuery.data;
  const utils = trpc.useUtils();
  const myRequests = trpc.paymentRequest.listMine.useQuery(undefined, { enabled: !loading && isAuthenticated });

  const selectService = (serviceKey: ServiceKey) => {
    setSelectedServiceKey(serviceKey);
    setStep("details");
    setProof(null);
  };

  const beginProofStep = () => {
    if (!selectedService) {
      toast("Choose the service you are paying for first.");
      return;
    }
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
    if (!selectedService) {
      toast("Choose a service before submitting a payment proof.");
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
      formData.append("serviceKey", selectedService.id);
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
      const payload = await response.json().catch(() => ({})) as { requestCode?: string; orderNumber?: string; message?: string };
      if (!response.ok) throw new Error(payload.message || "Unable to save this payment request.");

      await utils.paymentRequest.listMine.invalidate();
      toast(`Order ${payload.orderNumber ?? payload.requestCode ?? ""} was submitted for review.`);
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
    <section className="payment-hero"><div><p className="payment-eyebrow"><WalletCards size={14} /> PAYMENT REQUEST</p><h1>Choose a service.<br /><em>Then keep a clear record.</em></h1></div><p>Start with the product path you need. Payment details appear only after a service is selected. Never enter a password, PIN, card number, CVV or wallet credential.</p></section>
    <section className="payment-shell">
      <aside className="payment-steps"><p>PAYMENT PATH</p><ol><li className="active"><span>01</span> Choose service</li><li className={selectedService ? "active" : ""}><span>02</span> Choose method</li><li className={selectedService && step === "proof" ? "active" : ""}><span>03</span> Add details</li><li className={step === "proof" ? "active" : ""}><span>04</span> Upload proof</li></ol><div><ShieldCheck size={17} /><p>Your request remains <strong>pending review</strong> until staff verify the receipt and approved destination.</p></div></aside>
      <div className="payment-workspace">
        <section className="payment-service-stage"><div className="payment-section-heading"><div><p>01 / SELECT A SERVICE</p><h2>What are you<br />paying for?</h2></div><span>Start here</span></div><div className="payment-service-grid">{services.map((service, index) => <button type="button" key={service.id} className={selectedServiceKey === service.id ? "selected" : ""} onClick={() => selectService(service.id)}><span>0{index + 1}</span><strong>{service.label}</strong><small>{service.eyebrow}</small><i>{selectedServiceKey === service.id ? "Selected" : "Choose"}</i></button>)}</div>{selectedService && <div className="payment-service-summary"><div><span>SELECTED SERVICE</span><strong>{selectedService.label}</strong><p>{selectedService.description}</p></div><button type="button" onClick={() => setSelectedServiceKey(null)}>Change service</button></div>}</section>
        {!selectedService ? <section className="payment-gate"><CircleAlert size={20} /><div><strong>Payment information is locked.</strong><p>Choose the service or product above first. The payment route, amount and receipt steps will appear here after your selection.</p></div></section> : <>
          <section className="method-stage"><div className="payment-section-heading"><div><p>02 / SELECT A METHOD</p><h2>How will you make<br />the payment?</h2></div><span>Choose one route</span></div><label className="method-select"><span>Payment method</span><select value={selectedMethod} onChange={(event) => setSelectedMethod(event.target.value as typeof selectedMethod)}>{methods.map((method) => <option key={method.id} value={method.id}>{method.label} · {method.kind}</option>)}</select></label><div className={`selected-method-note${recipient ? " is-verified" : ""}`}><img src={selected.logo} alt={`${selected.label} logo`} /><div><p>{recipientQuery.isLoading ? "CHECKING PUBLISHED DESTINATION" : recipientQuery.error ? "DESTINATION LOOKUP UNAVAILABLE" : recipient ? "VERIFIED MERCHANT ACCOUNT" : "RECIPIENT NOT YET PUBLISHED"}</p><strong>{recipientQuery.isLoading ? "Loading verified details…" : recipientQuery.error ? "Try again shortly" : recipient ? recipient.accountName : "Provider onboarding in progress"}</strong>{recipientQuery.error ? <span>We could not load the published recipient details. Do not send funds until the verified destination is visible again.</span> : recipient ? <><b>{recipient.accountIdentifier}</b><span>{recipient.instructions}</span>{recipient.qrUrl && <a className="recipient-qr-link" href={recipient.qrUrl} target="_blank" rel="noreferrer"><img src={recipient.qrUrl} alt={`${recipient.providerLabel} payment QR`} />Open verified QR asset</a>}</> : <span>Official account instructions will appear here after staff verify the merchant account and publish the provider details.</span>}</div><CheckCircle2 size={20} /></div></section>
          {step === "details" ? <section className="payment-details"><div className="payment-section-heading"><div><p>03 / PAYMENT DETAILS</p><h2>Record only what<br />is needed.</h2></div><span>For {selectedService.label}</span></div><div className="payment-form-grid"><label>Full name<input value={payerName} onChange={(event) => setPayerName(event.target.value)} placeholder="Name of the payer" autoComplete="name" /></label><label>Account reference <small>Last 4 digits only</small><input value={accountHint} onChange={(event) => setAccountHint(event.target.value.replace(/[^0-9A-Za-z]/g, "").slice(-8))} placeholder="e.g. 4821" maxLength={8} /></label><label className="form-wide">Amount (MMK){selectedPrice?.priceMmk !== null && selectedPrice?.priceMmk !== undefined ? <small>Server quote · locked</small> : <small>Quote required</small>}<input inputMode="numeric" readOnly={selectedPrice?.priceMmk !== null && selectedPrice?.priceMmk !== undefined} value={amount} onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))} placeholder={selectedPrice?.priceLabel ?? "0"} /></label>{selectedPrice?.priceMmk === null || selectedPrice?.priceMmk === undefined ? <div className="amount-choices">{amountChoices.map((choice) => <button type="button" key={choice} className={Number(amount) === choice ? "selected" : ""} onClick={() => setAmount(String(choice))}>{choice.toLocaleString()} MMK</button>)}</div> : <p className="server-price-note">{selectedPrice.priceLabel} · This amount is controlled by the published service configuration.</p>}
<label className="form-wide">Payment reference <small>Optional</small><input value={reference} onChange={(event) => setReference(event.target.value.slice(0, 100))} placeholder="Transaction reference or note" /></label></div><div className="payment-warning"><CircleAlert size={17} /><p>Do not provide a password, PIN, full bank number, card number, CVV or wallet login credential. Use the official payment app or bank channel to make a payment.</p></div><button className="payment-primary" disabled={loading} onClick={beginProofStep}>Continue to proof <ArrowRight size={17} /></button></section> : <section className="payment-proof"><div className="payment-section-heading"><div><p>04 / UPLOAD PROOF</p><h2>Attach the receipt<br />after payment.</h2></div><button className="back-step" onClick={() => setStep("details")}>Edit details</button></div><label className={`proof-dropzone${proof ? " has-file" : ""}`}><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => setProof(event.target.files?.[0] ?? null)} /><Upload size={23} /><strong>{proof ? proof.name : "Choose receipt image or PDF"}</strong><span>{proof ? `${Math.ceil(proof.size / 1024)} KB selected` : "PNG, JPG, WEBP or PDF · maximum 10 MB"}</span></label><div className="proof-summary"><span>Service <b>{selectedService.label}</b></span><span>Route <b>{selected.label}</b></span><span>Amount <b>{Number(amount || 0).toLocaleString()} MMK</b></span></div><button className="payment-primary" disabled={isSubmitting} onClick={submitProof}><FileUp size={17} /> {isSubmitting ? "Uploading securely…" : "Submit proof for review"}</button></section>}
        </>}
        {isAuthenticated && <section className="payment-history"><p>RECENT REQUESTS</p>{myRequests.isLoading ? <span>Loading your payment records…</span> : myRequests.data?.length ? <ul>{myRequests.data.map((request) => { const progress = requestStatusCopy(request.status); return <li key={request.requestCode}><div><span>{request.serviceLabel ?? request.serviceKey ?? "Payment request"}</span><strong>{request.requestCode}</strong></div><div><b>{request.amountMmk.toLocaleString()} MMK</b><i>{progress.label}</i></div><small>{progress.next}{request.reviewNote ? ` Staff note: ${request.reviewNote}` : ""}</small></li>; })}</ul> : <span>No payment requests have been submitted from this account.</span>}</section>}
      </div>
    </section>
    <footer className="payment-footer"><Landmark size={17} /><p>Merchant instructions are published only after a provider account and any QR asset have been verified by CreatorHubPlus staff.</p></footer>
  </main>;
}
