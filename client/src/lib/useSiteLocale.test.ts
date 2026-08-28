// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSiteLocale } from "./useSiteLocale";

function LocaleProbe() {
  useSiteLocale("en", "CreatorHubPlus — English");
  return React.createElement("div", null, "en");
}

afterEach(() => {
  cleanup();
  delete window.CookieConsent;
  vi.useRealTimers();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-locale");
});

describe("site locale transition", () => {
  it("updates document metadata and synchronizes Cookie Consent while clearing the transition", () => {
    vi.useFakeTimers();
    const setLanguage = vi.fn();
    window.CookieConsent = { setLanguage };
    render(React.createElement(LocaleProbe));

    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dataset.locale).toBe("en");
    expect(document.title).toContain("English");
    expect(document.documentElement.classList.contains("locale-changing")).toBe(true);
    expect(setLanguage).toHaveBeenCalledWith("en");

    act(() => vi.advanceTimersByTime(180));
    expect(document.documentElement.classList.contains("locale-changing")).toBe(false);
    expect(setLanguage).toHaveBeenCalledTimes(2);
  });
});
