# Payment Rail Browser Diagnosis

On 2026-08-27, the live development preview was inspected in Chromium. The `.payment-rail-track` element matched its animation rule and reported `payment-rail-loop`, `28s` duration, `infinite` iteration count, and `running` play state. The browser did not report `prefers-reduced-motion: reduce`; its transform matrix had progressed to a negative X offset.

The rail was therefore animating, but the 28-second loop was too subtle to communicate movement reliably. The next visual correction should use a noticeably shorter, still readable loop duration while preserving hover/focus pause and the reduced-motion fallback.
