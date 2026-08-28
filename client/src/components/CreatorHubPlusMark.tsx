import React from "react";

type MarkTone = "teal" | "inverse";

type CreatorHubPlusMarkProps = {
  className?: string;
  decorative?: boolean;
  label?: string;
  tone?: MarkTone;
};

type CreatorHubPlusLockupProps = CreatorHubPlusMarkProps & {
  descriptor?: string;
};

/**
 * CreatorHubPlus C+ Link mark.
 * A compact open C holds a precise plus sign in its aperture: one memorable symbol
 * for creator support, connection and an added next step. It is legible from favicon to header scale.
 */
export function CreatorHubPlusMark({
  className = "",
  decorative = false,
  label = "CreatorHubPlus",
  tone = "teal",
}: CreatorHubPlusMarkProps) {
  return (
    <svg
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      className={`creatorhubplus-cmark creatorhubplus-cmark--${tone} ${className}`}
      fill="none"
      role={decorative ? undefined : "img"}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path className="creatorhubplus-cmark__arc" d="M45.6 18.2A20.5 20.5 0 1 0 45.6 45.8" />
      <path className="creatorhubplus-cmark__plus" d="M47 26.6V37.4M41.6 32H52.4" />
    </svg>
  );
}

export function CreatorHubPlusLockup({
  className = "",
  decorative = false,
  descriptor,
  label = "CreatorHubPlus",
  tone = "teal",
}: CreatorHubPlusLockupProps) {
  return (
    <span
      aria-label={decorative ? undefined : label}
      className={`creatorhubplus-logo creatorhubplus-logo--${tone} ${className}`}
      role={decorative ? undefined : "img"}
    >
      <CreatorHubPlusMark decorative tone={tone} />
      <span aria-hidden="true" className="creatorhubplus-logo__words" data-wordmark="creatorhubplus">
        <span>creatorhub</span><strong>plus</strong>
        {descriptor ? <small>{descriptor}</small> : null}
      </span>
    </span>
  );
}
