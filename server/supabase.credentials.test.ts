import { describe, expect, it } from "vitest";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.SUPABASE_DB_URL;

/**
 * Live smoke test for the deployment credentials. It only runs when the real
 * deployment environment variables are present (GitHub Actions CI and local
 * developer machines do not have them), so `pnpm test` stays green everywhere
 * and still verifies the real credentials on deployments that expose them.
 */
const hasDeploymentCredentials = Boolean(
  supabaseUrl &&
    supabaseUrl !== "https://placeholder.supabase.co" &&
    publishableKey &&
    serviceRoleKey &&
    databaseUrl
);

describe.skipIf(!hasDeploymentCredentials)("Supabase deployment credentials", () => {
  it("accepts the browser key at the Auth settings endpoint", async () => {
    expect(supabaseUrl).toBeTruthy();
    expect(publishableKey).toBeTruthy();

    const response = await fetch(`${supabaseUrl!.replace(/\/$/, "")}/auth/v1/settings`, {
      headers: {
        apikey: publishableKey!,
        Authorization: `Bearer ${publishableKey!}`,
      },
    });

    expect(response.ok).toBe(true);
  });

  it("accepts the server key without exposing it to browser code", async () => {
    expect(supabaseUrl).toBeTruthy();
    expect(serviceRoleKey).toBeTruthy();

    const response = await fetch(`${supabaseUrl!.replace(/\/$/, "")}/auth/v1/settings`, {
      headers: {
        apikey: serviceRoleKey!,
        Authorization: `Bearer ${serviceRoleKey!}`,
      },
    });

    expect(response.ok).toBe(true);
  });

  it("reaches the PostgREST data endpoint over HTTPS", async () => {
    expect(databaseUrl).toMatch(/^postgres(?:ql)?:\/\//);
    expect(supabaseUrl).toBeTruthy();
    expect(serviceRoleKey).toBeTruthy();

    const response = await fetch(`${supabaseUrl!.replace(/\/$/, "")}/rest/v1/`, {
      headers: {
        apikey: serviceRoleKey!,
        Authorization: `Bearer ${serviceRoleKey!}`,
      },
    });

    expect(response.ok).toBe(true);
  });
});