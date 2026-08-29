import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2, KeyRound, Loader2, Lock, Mail, MonitorSmartphone, X, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type AuthStatus = "idle" | "sending" | "sent" | "error";
type AuthMode = "link" | "password";

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
    return { message: "That email address doesnâ€™t look right. Check it and try again.", cooldownSeconds: null };
  }
  if (lower.includes("email not confirmed")) {
    return { message: "This email cannot receive sign-in links yet. Contact support for help.", cooldownSeconds: null };
  }
  return { message: "We could not send the link. Please try again in a moment.", cooldownSeconds: null };
}

/** Translate a Supabase password-sign-in failure into friendly copy. */
function describePasswordError(code: string | undefined, message: string): string {
  const lower = message.toLowerCase();
  if (code === "invalid_credentials" || lower.includes("invalid login credentials")) {
    return "The email or password is incorrect. Check both and try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "This email has not been confirmed yet. Use the secure link to sign in once first.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return message || "We could not sign you in. Please try again.";
}

export default function AuthDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [resetSent, setResetSent] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const openDialog = () => {
      setOpen(true);
      setStatus("idle");
      setError("");
      setResetSent(false);
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

  // Focus the password field when switching to password mode.
  useEffect(() => {
    if (open && mode === "password" && status === "idle") {
      window.setTimeout(() => passwordInputRef.current?.focus(), 0);
    }
  }, [open, mode, status]);

  if (!open) return null;

  const switchMode = (next: AuthMode) => {
    if (status === "sending") return;
    setMode(next);
    setError("");
    setStatus("idle");
    setResetSent(false);
    setCooldownSeconds(0);
  };

  const submitLink = async (event: FormEvent) => {
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

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus("sending");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authError) {
      setError(describePasswordError(authError.code, authError.message || ""));
      setStatus("error");
      return;
    }
    // Session is established; the auth listener invalidates auth.me and the
    // dialog can close immediately.
    setStatus("sent");
    window.setTimeout(() => setOpen(false), 400);
  };

  const sendReset = async () => {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setError("");
    setStatus("sending");
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (authError) {
      setError(describeOtpError(authError.code, authError.message || "").message);
      setStatus("error");
      return;
    }
    setStatus("sent");
    setResetSent(true);
  };

  const retry = () => {
    setStatus("idle");
    setError("");
    setResetSent(false);
    window.setTimeout(() => emailInputRef.current?.focus(), 0);
  };

  const sending = status === "sending";
  const waitingForResend = cooldownSeconds > 0;

  return (
    <div className="auth-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target && status !== "sending") setOpen(false); }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title" aria-describedby="auth-dialog-description">
        <button className="auth-dialog-close" type="button" aria-label="Close sign in" disabled={status === "sending"} onClick={() => setOpen(false)}><X size={18} /></button>
        <p className="payout-eyebrow"><Mail size={14} /> SECURE ACCESS</p>
        <div className="auth-dialog-tabs" role="tablist" aria-label="Sign-in method">
          <button type="button" role="tab" aria-selected={mode === "link"} className={mode === "link" ? "auth-tab active" : "auth-tab"} onClick={() => switchMode("link")}><Mail size={14} /> Secure link</button>
          <button type="button" role="tab" aria-selected={mode === "password"} className={mode === "password" ? "auth-tab active" : "auth-tab"} onClick={() => switchMode("password")}><KeyRound size={14} /> Password</button>
        </div>
        <h2 id="auth-dialog-title">Sign in with a<br /><em>{mode === "link" ? "secure link." : "password."}</em></h2>
        <p id="auth-dialog-description" className="auth-dialog-status" aria-live="polite">
          {sending ? <><Loader2 className="auth-dialog-spinner" size={17} aria-hidden="true" /> {mode === "link" ? "Sending your secure linkâ€¦" : resetSent ? "Sending reset linkâ€¦" : "Signing you inâ€¦"}</> : status === "sent" ? <><CheckCircle2 size={17} aria-hidden="true" /> {resetSent ? "Reset link sent" : "Link ready to open"}</> : status === "error" ? <><XCircle size={17} aria-hidden="true" /> {mode === "link" ? "We could not send the link" : "We could not sign you in"}</> : mode === "link" ? "Enter your email and weâ€™ll send a one-time sign-in link." : "Enter your account email and password."}
        </p>
        {status === "sent" && !resetSent ? (
          <div className="auth-dialog-message" aria-live="polite"><strong>Check your inbox.</strong><p>{mode === "link" ? <>We sent a one-time sign-in link to <b>{email}</b>. Open it to return to CreatorHubPlus.</> : <>You are signed in as <b>{email}</b>.</>}</p>{mode === "link" && <p className="auth-dialog-hint"><MonitorSmartphone size={14} aria-hidden="true" /> Open the link in this same browser â€” the sign-in only completes where you requested it.</p>}<button type="button" className="auth-dialog-secondary" onClick={retry}>Use another email <ArrowUpRight size={15} /></button></div>
        ) : (
          <form onSubmit={mode === "link" ? submitLink : submitPassword}>
            <label htmlFor="auth-email">Email address</label>
            <input ref={emailInputRef} id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); if (status === "error") setStatus("idle"); }} placeholder="you@example.com" disabled={sending} />
            {mode === "password" && (
              <>
                <label htmlFor="auth-password">Password</label>
                <div className="auth-password-wrap">
                  <Lock size={15} aria-hidden="true" />
                  <input ref={passwordInputRef} id="auth-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => { setPassword(event.target.value); if (status === "error") setStatus("idle"); }} placeholder="Your password" disabled={sending} />
                </div>
                <button type="button" className="auth-dialog-link-button" onClick={sendReset} disabled={sending}>Forgot your password? Send a reset link</button>
              </>
            )}
            {status === "error" && <p className="auth-dialog-error" role="alert">{error}</p>}
            {waitingForResend && <p className="auth-dialog-cooldown" role="status">You can request a new link in {cooldownSeconds}s.</p>}
            <button className="auth-dialog-submit" type="submit" disabled={sending || waitingForResend}>{sending ? <><Loader2 className="auth-dialog-spinner" size={16} aria-hidden="true" /> {mode === "link" ? "Sending secure linkâ€¦" : "Signing inâ€¦"}</> : waitingForResend ? <>Wait {cooldownSeconds}s to resend</> : mode === "link" ? <>Send magic link <ArrowUpRight size={16} /></> : <>Sign in <ArrowUpRight size={16} /></>}</button>
            {status === "error" && <button className="auth-dialog-retry" type="button" onClick={retry}>Try again</button>}
            <p className="auth-dialog-note">{mode === "link" ? "No password is stored here. Your link is single-use and completes in this browser only." : "Your password is verified by our secure sign-in provider. Never share it."}</p>
          </form>
        )}
      </section>
    </div>
  );
}