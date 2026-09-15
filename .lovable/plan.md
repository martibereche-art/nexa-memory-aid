# NEXA upgrade

Preserve existing pages, data, guest mode, email sign-in, navigation, and Arabic/English/French design.

## Additions
- Add managed Google sign-in to login and registration, with translated loading/error states and existing account/profile creation.
- Add NEXA Prime page and consistent crown badges across dashboard, profile, and settings. Display weekly $1.99, monthly $5.99 (Most Popular), yearly $39.99 (Best Value).
- Store subscription plan, provider, dates and status securely. Only verified provider events may grant access; users cannot edit subscriptions.
- Add six background previews, retaining the original as free. Persist premium selections through server-validated preferences; expired users return to the original without losing their saved selection.
- Add opt-in Prime notification sounds and volume controls. Retain written notifications and history for everyone. Use a distinctive NEXA sound with additional sound choices; enforce entitlements on protected requests.
- Add Coming Soon in More with Appointments and My Health preview cards. Clearly label future benefits as unavailable, not active subscription benefits.
- Translate every addition into Arabic, English and French and preserve RTL.

## Payments and Android
Your current Lovable plan is Free; built-in payments require Pro or higher. Until payments are enabled, display pricing and an honest unavailable-checkout state—never simulate purchases or activate Prime.

After the plan upgrade, run provider eligibility, request your confirmation, enable test payments, then create products and implement verified webhooks, checkout and subscription management. Live payments require provider verification/account claim.

Keep billing-provider adapters separate: web checkout must not automatically appear in the Google Play version. Android subscriptions will require Google Play Billing and server-verified purchases before release there.

## Technical implementation
Use additive database migrations with owner-read RLS, explicit grants and service-only subscription writes. Use authenticated server functions for entitlement checks and premium preferences. Subscription access uses verified status plus expiration dates, with canceled subscriptions retaining access only through their paid period. Separate web audio delivery from future native notification adapters. Browser audio requires user interaction and is not guaranteed when the app is closed.

## Verification
Test guest navigation and CRUD persistence, existing email flow, Google configuration, translated new pages, free-user restrictions, entitlement expiry logic, settings persistence, and mobile RTL/overflow. Test paid checkout and verified activation only once payment setup is unblocked; do not claim those tests passed beforehand.
