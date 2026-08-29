import { startLogin } from "@/const";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Centralised handling of the Supabase magic-link return visit.
 *
 * When the user opens the email link, Supabase redirects back with either:
 *  - PKCE:  `?code=...` (the default flow used by signInWithOtp)
 *  - Implicit: `#access_token=...`
 *  - Failure: `?error=...&error_code=...&error_description=...` (expired/used link)
 *
 * supabase-js (detectSessionInUrl: true) performs the exchange itself; this
 * module only observes the outcome, gives one-time human feedback, cleans the
 * URL so a refresh cannot replay the flow, and offers a way back to the
 * sign-in dialog when the link cannot be completed. A PKCE code verifier only
 * exists in the browser that started the sign-in, so a link opened in a
 * different browser (or an expired link) can never establish a session here —
 * that case gets the clearest recovery copy.
 */

type AuthReturnKind = "pkce" | "implicit" | "error";

type AuthReturnContext = {
  kind: AuthReturnKind;
  errorCode: string | null;
  errorDescription: string | null;
};

/** Auth-related query/hash params that must never survive a page refresh. */
const AUTH_URL_PARAMS = [
  "code",
  "state",
  "error",
  "error_code",
  "error_description",
  "error_uri",
  "type",
] as const;

const SESSION_WAIT_TIMEOUT_MS = 10_000;
const SESSION_POLL_INTERVAL_MS = 250;

function readAuthReturnContext(): AuthReturnContext | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith("#")
    ? new URLSearchParams(window.location.hash.slice(1))
    : new URLSearchParams();

  // A Supabase error redirect carries `error` in the query string.
  if (params.get("error")) {
    return {
      kind: "error",
      errorCode: params.get("error_code") ?? params.get("error"),
      errorDescription: params.get("error_description"),
    };
  }

  // Implicit-style failure surfaces in the hash instead.
  if (hash.get("error")) {
    return {
      kind: "error",
      errorCode: hash.get("error_code") ?? hash.get("error"),
      errorDescription: hash.get("error_description"),
    };
  }

  if (params.get("code")) return { kind: "pkce", errorCode: null, errorDescription: null };
  if (hash.get("access_token")) return { kind: "implicit", errorCode: null, errorDescription: null };
  return null;
}

/** Remove magic-link params from the address bar without touching other params. */
export function cleanAuthReturnUrl(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  let changed = false;

  for (const param of AUTH_URL_PARAMS) {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      changed = true;
    }
  }
  if (url.hash) {
    const hashParams = new URLSearchParams(url.hash.slice(1));
    let hashChanged = false;
    for (const param of AUTH_URL_PARAMS) {
      if (hashParams.has(param)) {
        hashParams.delete(param);
        hashChanged = true;
      }
    }
    if (hashChanged) {
      const rest = hashParams.toString();
      url.hash = rest ? `#${rest}` : "";
      changed = true;
    }
  }
  if (changed) {
    window.history.replaceState(window.history.state, "", url.toString());
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Wait for supabase-js to finish its own URL detection. `getSession()` awaits
 * the client's internal initialization (including the PKCE exchange), and the
 * short poll guards against sessions that land slightly later.
 */
async function waitForSessionFromReturnVisit(): Promise<boolean> {
  const deadline = Date.now() + SESSION_WAIT_TIMEOUT_MS;
  for (;;) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) return true;
    } catch {
      // Verification/exchange errors surface as "no session" below.
    }
    if (Date.now() >= deadline) return false;
    await sleep(SESSION_POLL_INTERVAL_MS);
  }
}

function reportSuccess(): void {
  toast.success("You're signed in.", { description: "Welcome back to CreatorHubPlus." });
}

function reportFailure(context: AuthReturnContext): void {
  const expiredByServer =
    context.kind === "error" &&
    (context.errorCode === "otp_expired" ||
      context.errorCode === "access_denied" ||
      /expire|invalid|used/i.test(context.errorDescription ?? ""));

  const message = expiredByServer
    ? "Your sign-in link has expired or was already used. Request a new link below."
    : "Your sign-in link has expired or was opened in a different browser. Request a new link below.";

  toast.error("Sign-in could not be completed", {
    description: message,
    duration: Infinity,
    action: {
      label: "Send a new link",
      onClick: () => startLogin(),
    },
  });
}

/** Observe one auth return visit per page load. Safe to call once at startup. */
export async function initAuthReturnHandling(): Promise<void> {
  const context = readAuthReturnContext();
  if (!context) return;

  try {
    const hasSession = await waitForSessionFromReturnVisit();
    if (hasSession) {
      reportSuccess();
    } else {
      reportFailure(context);
    }
  } finally {
    cleanAuthReturnUrl();
  }
}
