import React from "react";

/** Decorative depth layer for the global terminal theme. It never receives input or accessibility focus. */
export function TechField() {
  return (
    <div className="tech-field" aria-hidden="true">
      <span className="tech-field__grid" />
      <span className="tech-field__halo tech-field__halo--one" />
      <span className="tech-field__halo tech-field__halo--two" />
      <span className="tech-field__scan" />
    </div>
  );
}
