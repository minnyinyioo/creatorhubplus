import { describe, expect, it } from "vitest";
import { filterAndSortRecipientProviders } from "./StaffRecipients";

describe("merchant recipient list controls", () => {
  const providers = [
    { id: "kbzpay", label: "KBZ Pay", kind: "Wallet" },
    { id: "kbzbank", label: "KBZ Bank", kind: "Bank" },
    { id: "wavepay", label: "Wave Pay", kind: "Wallet" },
  ] as const;
  const recipients = [
    { paymentMethod: "kbzbank", providerLabel: "KBZ Bank", kind: "Bank", isActive: 1, updatedAt: new Date("2026-08-26") },
    { paymentMethod: "kbzpay", providerLabel: "KBZ Pay", kind: "Wallet", isActive: 0, updatedAt: new Date("2026-08-20") },
  ];

  it("filters by route type and provider search", () => {
    expect(filterAndSortRecipientProviders(providers, recipients, "kbz", "Bank", "provider").map((provider) => provider.id)).toEqual(["kbzbank"]);
  });

  it("sorts published and recently updated providers without mutation", () => {
    const result = filterAndSortRecipientProviders(providers, recipients, "", "all", "published");
    expect(result.map((provider) => provider.id)).toEqual(["kbzbank", "kbzpay", "wavepay"]);
    expect(providers.map((provider) => provider.id)).toEqual(["kbzpay", "kbzbank", "wavepay"]);
    expect(filterAndSortRecipientProviders(providers, recipients, "", "all", "updated")[0].id).toBe("kbzbank");
  });
});
