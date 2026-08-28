export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export function startLogin() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("creatorhubplus:open-auth"));
}
