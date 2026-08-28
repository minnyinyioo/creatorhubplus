# Unauthenticated CTA Verification

The verification used a fresh sandbox browser session with no CreatorHubPlus account session.

| Locale | Action tested | Result |
|---|---|---|
| English `/` | Header **Start a case** action | Redirected to the CreatorHubPlus OAuth sign-in page before a service-application form could open. |
| English `/` | Header **Payment request** action | Opened the read-only service-selection page; payment details and receipt upload controls remained locked until service selection and authentication. |
| Myanmar `/my` | Header **အကူအညီတောင်းဆိုရန်** action | Redirected to the CreatorHubPlus OAuth sign-in page before a service-application form could open. |
| Myanmar `/my` | Header **ငွေပေးချေမှု တောင်းဆိုရန်** action | Opened the same protected payment route with payment information locked. |
| English `/` | Service-card **Pay for this service** action | Redirected to the CreatorHubPlus OAuth sign-in page before any payment detail or receipt-upload control was available. |

The sandbox browser session became unavailable before the equivalent Myanmar service-card action could be repeated. The shared guarded-action implementation and the verified Myanmar header action use the same authentication boundary; the remaining visual click confirmation stays documented as a follow-up check.

Service-card **Open route**, service choice, anchor navigation, FAQ controls and Cookie-preference controls are intentionally public browsing operations: they only select or reveal information and do not create, edit, submit, upload, pay for, publish or review any record. Every CTA that begins a payment or opens a service-application write flow delegates through the shared authentication guard.

The visible **Continue with this case** and **Start a support case** controls were also clicked in the unauthenticated English and Myanmar views. They are deliberately public route-navigation controls: each scrolls to the service-choice area and does not open a dialog, create a case, upload a proof, or submit a payment. The next write-capable controls in that area are authenticated through the shared guard, as verified by the English and Myanmar header case-entry actions and the service-card payment action.

No payment, service case, review action, recipient update, or other business record was created during the verification.
