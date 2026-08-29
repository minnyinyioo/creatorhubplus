import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Mail, MonitorSmartphone, X, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type AuthStatus = "idle" | "sending" | "sent" | "error";

/** Fallback wait (seconds) when Supabase does not report a retry window. */
const DEFAULT_RATE_LIMIT_SECONDS = 60;

function extractRateLimitSeconds(message: string): number | null {
  const match = message.match(/(\d+)\s*(?:seconds?|secs?|s)\b/i);
  if (match) {
    const seconds = Number.parseInt(match[1], 10);
    if (Number.isFinite(seconds) && seconds > 0) return Math.min(seconds, 600);
  }
  return null;
}

type OtpErrorCopy = { message: string; cooldownSeconds: number | null };

/** Translate a Supabase OTP failure into friendly, recoverable copy. */
function describeOtpError(code: string | undefined, message: string): OtpErrorCopy {
  const lower = message.toLowerCase();
  if (code === "over_email_send_rate_limit" || lower.includes("rate limit") || lower.includes("too many")) {
    return {
      message: "Too many sign-in emails were requested for now.",
      cooldownSeconds: extractRateLimitSeconds(message) ?? DEFAULT_RATE_LIMIT_SECONDS,
    };
  }
  if (code === "invalid_email" || lower.includes("invalid email") || lower.includes("unable to validate email")) {
    return { message: "That email address doesn’t look right. Check it and try again.", cooldownSeconds: null };
  }
  if (lower.includes("email not confirmed")) {
    return { message: "This email cannot receive sign-in links yet. Contact support for help.", cooldownSeconds: null };
  }
  return { message: "We could not send the link. Please try again in a moment.", cooldownSeconds: null };
}

export default function AuthDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
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

  // Tick down the resend cooldown so the submit button re-enables on time.
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownSeconds((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

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
      const copy = describeOtpError(authError.code, authError.message || "");
      setError(copy.message);
      if (copy.cooldownSeconds) setCooldownSeconds(copy.cooldownSeconds);
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

  const sending = status === "sending";
  const waitingForResend = cooldownSeconds > 0;

  return (
    <div className="auth-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target && status !== "sending") setOpen(false); }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title" aria-describedby="auth-dialog-description">
        <button className="auth-dialog-close" type="button" aria-label="Close sign in" disabled={status === "sending"} onClick={() => setOpen(false)}><X size={18} /></button>
        <p className="payout-eyebrow"><Mail size={14} /> SECURE ACCESS</p>
        <h2 id="auth-dialog-title">Sign in with a<br /><em>secure link.</em></h2>
        <p id="auth-dialog-description" className="auth-dialog-status" aria-live="polite">
          {sending ? <><Loader2 className="auth-dialog-spinner" size={17} aria-hidden="true" /> Sending your secure link…</> : status === "sent" ? <><CheckCircle2 size={17} aria-hidden="true" /> Link ready to open</> : status === "error" ? <><XCircle size={17} aria-hidden="true" /> We could not send the link</> : "Enter your email and we’ll send a one-time sign-in link."}
        </p>
        {status === "sent" ? (
          <div className="auth-dialog-message" aria-live="polite"><strong>Check your inbox.</strong><p>We sent a one-time sign-in link to <b>{email}</b>. Open it to return to CreatorHubPlus.</p><p className="auth-dialog-hint"><MonitorSmartphone size={14} aria-hidden="true" /> Open the link in this same browser — the sign-in only completes where you requested it.</p><button type="button" className="auth-dialog-secondary" onClick={retry}>Use another email <ArrowUpRight size={15} /></button></div>
        ) : (
          <form onSubmit={submit}>
            <label htmlFor="auth-email">Email address</label>
            <input ref={emailInputRef} id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); if (status === "error") setStatus("idle"); }} placeholder="you@example.com" disabled={sending} />
            {status === "error" && <p className="auth-dialog-error" role="alert">{error}</p>}
            {waitingForResend && <p className="auth-dialog-cooldown" role="status">You can request a new link in {cooldownSeconds}s.</p>}
            <button className="auth-dialog-submit" type="submit" disabled={sending || waitingForResend}>{sending ? <><Loader2 className="auth-dialog-spinner" size={16} aria-hidden="true" /> Sending secure link…</> : waitingForResend ? <>Wait {cooldownSeconds}s to resend</> : <>Send magic link <ArrowUpRight size={16} /></>}</button>
            {status === "error" && <button className="auth-dialog-retry" type="button" onClick={retry}>Try again</button>}
            <p className="auth-dialog-note">No password is stored here. Your link is single-use and completes in this browser only.</p>
          </form>
        )}
      </section>
    </div>
  );
}
