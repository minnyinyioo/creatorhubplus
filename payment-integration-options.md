# CreatorHubPlus Payment Integration Assessment

## Security boundary

The payment-request workflow must never collect passwords, PINs, card CVV values, full bank-login details, or private wallet credentials. A proof image is supporting evidence only and must be stored privately. The final payment status must remain **pending verification** until checked through a legitimate merchant channel or by an authorised administrator.

## Official integration findings

| Option | What the official source confirms | Practical implication |
|---|---|---|
| Wave Merchant / Pay with Wave | Wave advertises merchant portal access, API integration, settlement, transaction history and real-time payment notifications, with an application route for integration. [1] | Suitable for a real payment flow after merchant onboarding and credentials are issued. It is not a public, credential-free payment API. |
| KBZ DirectPay | KBZ describes an e-commerce gateway and lists a KBZ Corporate Bank account, master agreement, Direct Pay SLA, merchant setup form and HTTPS site as sign-up requirements. [2] | Suitable after corporate merchant onboarding. It is not a free, plug-and-play public checkout API. |
| Community-maintained code libraries | Open-source wrappers can simplify request signing and gateway calls but do not replace the merchant account, agreements, API credentials, settlement controls or payment-provider fees. | Useful only after selecting and onboarding with a licensed payment provider. |

## Recommended implementation choices

| Approach | Tradeoffs | Cost | Setup complexity |
|---|---|---:|---|
| **Proof-of-payment request** | A user selects a method, submits safe contact/payment reference details and a receipt image. Staff verifies before marking paid. No automatic fund capture. | No gateway charge; normal storage cost only. | Low; appropriate to launch first. |
| **Official merchant checkout** | Redirects or creates a payment session using an approved provider and receives verified status callbacks. Requires merchant onboarding, legal agreements and secure credentials. | Provider pricing and settlement terms apply. | Higher; appropriate after the business merchant account is approved. |

## Sources

[1] [Wave Money — Payment Integration with Wave](https://www.wavemoney.com.mm/partner/pay-with-wave/)

[2] [KBZ Bank — KBZ DirectPay](https://www.kbzbank.com/en/other-services-en/kbz-directpay/)
