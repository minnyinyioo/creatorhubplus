# Service-first payment flow verification

The revised `/payment` page now opens with a four-option service selector. Desktop and 390px mobile previews show the service selection stage before any payment method, recipient, amount, or receipt controls. The page explicitly states that payment information remains locked until a service is selected. The desktop layout uses a two-column service grid, while the mobile layout uses a single-column grid.

The payment request schema now requires a supported `serviceKey`; submitted rows store both `serviceKey` and the canonical service label. User request history displays the selected service and a next-step message for pending review, clarification requested, verified, or rejected states. Staff review rows and the detail panel display the service label alongside payer, payment method, amount, and receipt information.

No payment was submitted during this verification. Cookie consent obscures some lower viewport content in the preview, but the service-first gate and upper service selector remain visible and readable.

A temporary `payout_receiving` default selection was used for deterministic preview only. The desktop and mobile captures showed the service stage and the payment path advancing to the method step; the temporary default will be restored to an empty selection before the checkpoint so real users must choose a service themselves.

Directly viewed full-page captures for `/payment?service=payout_receiving` at 1280×1200 and 390×1200. Both show the `Payout & receiving` card selected, the selected-service summary, the payment-method selector, the published-recipient lookup panel, the MMK amount/details form, and the continue-to-proof action in the intended sequence. The mobile capture shows the service cards in one column and no horizontal overflow.

Directly viewed the selected-service proof-step captures at 1280×900 and 390×1400. The proof state shows `04 / UPLOAD PROOF`, a receipt image/PDF chooser, edit-details control, service/route/amount summary, and submit-for-review action. The mobile capture keeps these controls in a single readable column without horizontal overflow. This state was produced only for deterministic preview and will be restored to the normal details step before delivery.

Direct inspection confirmed the latest captures: the desktop selected-service payment page shows the `Payout & receiving` card selected, the payment method selector, recipient onboarding/lookup panel, payment details area, and the staged proof step; the 390px full-page capture shows the same flow as a single readable column with no horizontal overflow. The proof capture visibly contains the receipt image/PDF chooser, service/route/amount summary, and `Submit proof for review` action.
