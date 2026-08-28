import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Mail, X, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type AuthStatus = "idle" | "sending" | "sent" | "error";

export default function AuthDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const openDialog = () => {
      setOpen(true);
      setStatus("idle");
      setError("");
      window.setTimeout(() => emailInputRef.current?.focus(), 0);
    };
    window.addEventListener("creatorhubplus:open-auth", openDialog);
    return () => window.removeEventListener("creatorhubplus:open-auth", openDialog);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && status !== "sending") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, status]);

  if (!open) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus("sending");
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (authError) {
      setError(authError.message || "We could not send the link. Please try again.");
      setStatus("error");
      return;
    }
    setStatus("sent");
  };

  const retry = () => {
    setStatus("idle");
    setError("");
    window.setTimeout(() => emailInputRef.current?.focus(), 0);
  };

  return (
    <div className="auth-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target && status !== "sending") setOpen(false); }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title" aria-describedby="auth-dialog-description">
        <button className="auth-dialog-close" type="button" aria-label="Close sign in" disabled={status === "sending"} onClick={() => setOpen(false)}><X size={18} /></button>
        <p className="payout-eyebrow"><Mail size={14} /> SECURE ACCESS</p>
        <h2 id="auth-dialog-title">Sign in with a<br /><em>secure link.</em></h2>
        <p id="auth-dialog-description" className="auth-dialog-status" aria-live="polite">
          {status === "sending" ? <><Loader2 className="auth-dialog-spinner" size={17} aria-hidden="true" /> Sending your secure link…</> : status === "sent" ? <><CheckCircle2 size={17} aria-hidden="true" /> Link ready to open</> : status === "error" ? <><XCircle size={17} aria-hidden="true" /> We could not send the link</> : "Enter your email and we’ll send a one-time sign-in link."}
        </p>
        {status === "sent" ? (
          <div className="auth-dialog-message" aria-live="polite"><strong>Check your inbox.</strong><p>We sent a one-time sign-in link to <b>{email}</b>. Open it to return to CreatorHubPlus.</p><button type="button" className="auth-dialog-secondary" onClick={retry}>Use another email <ArrowUpRight size={15} /></button></div>
        ) : (
          <form onSubmit={submit}>
            <label htmlFor="auth-email">Email address</label>
            <input ref={emailInputRef} id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); if (status === "error") setStatus("idle"); }} placeholder="you@example.com" disabled={status === "sending"} />
            {status === "error" && <p className="auth-dialog-error" role="alert">{error}</p>}
            <button className="auth-dialog-submit" type="submit" disabled={status === "sending"}>{status === "sending" ? <><Loader2 className="auth-dialog-spinner" size={16} aria-hidden="true" /> Sending secure link…</> : <>Send magic link <ArrowUpRight size={16} /></>}</button>
            {status === "error" && <button className="auth-dialog-retry" type="button" onClick={retry}>Try again</button>}
            <p className="auth-dialog-note">No password is stored here. Your link is single-use.</p>
          </form>
        )}
      </section>
    </div>
  );
}
