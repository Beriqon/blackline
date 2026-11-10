# Remaining balance payments

Implemented for confirmed priced orders. Quotes and proposal approval are not part of this flow.

- Open an online booking in Admin → Bookings → Request remaining payment.
- Copy the private link and send it to the guest manually. No email is sent automatically.
- The link lasts 30 days. Requesting it again reuses the same balance record and extends validity.
- Stripe test orders use embedded Stripe test checkout, charging the entire remaining balance. Klarna is eligible for this full balance payment; Stripe decides availability.
- Confirmed Zelle orders use Zelle instructions, mandatory private screenshot upload and explicit admin bank verification. Rejecting a balance proof leaves the existing confirmed reservation intact.
- Methods follow the original order. Real Zelle orders cannot be settled using a simulated Stripe test payment.
- The original order number and booking records are retained. Quote lines stay excluded.
- Signed Stripe webhooks settle the order atomically and idempotently. The return page can reconcile a delayed webhook using Stripe's verified API response.
- Expiring a balance session never cancels the original reservation. Reopening creates a new attempt only after the earlier session has expired.
- Admin totals, the original confirmation URLs and newly downloaded PDFs use cumulative confirmed payments. Existing PDF files cannot change retrospectively.
- The paid balance page uses the shared Blackline confirmation design, with product photos, initial payment, balance payment and zero outstanding priced balance.

## Database

`supabase/balance-payments.sql` was applied to the connected Blackline database. The private balance table has no direct browser grants. Server RPC calls require the existing server-only booking credential; the admin list RPC checks admin membership.

## Validation

`tests/balance-payments.test.mjs` covers signed-link access, webhook validation, server-priced session reuse and the admin guard. `tests/balance-database.sql` exercises transactional settlement, retries, expiry, Zelle proof/review and privacy; it rolls back all synthetic fixtures.

An embedded Stripe sandbox card payment was completed and settled by a real test webhook. Its updated PDF was checked visually and for exact monetary values. The temporary database fixture was removed afterwards. Stripe now follows the explicitly configured test/live mode; see stripe-live-launch.md. No deployment was performed.
