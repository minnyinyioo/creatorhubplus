# Locale verification notes

- `/privacy` rendered the English title `CreatorHubPlus — Privacy Policy`, English navigation, English policy headings and English body copy; its language entry was `မြန်မာ` and linked to `/my/privacy`.
- `/my/privacy` rendered the Burmese title `CreatorHubPlus — ကိုယ်ရေးအချက်အလက် မူဝါဒ`, Burmese navigation, Burmese policy headings and Burmese body copy; its language entry was `English` and linked back to `/privacy`.
- `/` and `/my` were previously checked in the browser: each showed the matching title, language entry and localized primary content.
- The shared `useSiteLocale` hook now updates `document.documentElement.lang`, `data-locale`, title and Cookie Consent language, then removes the `locale-changing` class after a short transition.
- Desktop and mobile responsive captures covered `/`, `/my`, `/account`, `/staff/recipients` and `/staff/review`. Account and operations pages remain English-only by design; the public bilingual routes carry the Burmese localization.

- `/terms` rendered the English title `CreatorHubPlus — Terms of Service`, an English terms document, and a `မြန်မာ` link to `/my/terms`.
- `/my/terms` rendered the Burmese title `CreatorHubPlus — ဝန်ဆောင်မှုအသုံးပြုမှု စည်းကမ်းများ`, Burmese terms headings/body, and an `English` link back to `/terms`.
