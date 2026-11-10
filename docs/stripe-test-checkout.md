# Stripe test checkout

This integration deliberately rejects live API keys and live webhook events.
The public catalog remains the product and price source. One Stripe product,
`blackline_booking_test_v1`, is reused, with an inline price for each deposit.
Stripe still keeps payment/price records; no catalog synchronization occurs.

## Embedded Blackline payment page

The cart now opens `/payment/checkout?session_id=...`. The server validates
the test session, order reference, USD currency and amount before passing its
client secret to Stripe's Checkout Elements provider. The Stripe-hosted page
is no longer used for new orders. Existing hosted-session confirmations still work.

Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` from the **same sandbox**
as the server key. This is intentionally public; the secret key and webhook
secret remain server-only. Neither secret is sent to browser components.

Payment methods are dynamically selected by Stripe from the account's enabled
methods, currency, customer and device eligibility. We do not hardcode card-only
sessions or claim that every Stripe method is available. USD is retained and
Adaptive Pricing is disabled. iDEAL is not part of this flow. Apple Pay and
Google Pay require HTTPS and applicable domain/device setup; they do not appear
on the current HTTP localhost test page. Link, card and supported alternative
payment options render inside the secure Stripe elements.

Zelle is a separate **visual preview only**. It shows the deposit and reference
but has no payment recipient details or submit operation. Choosing Zelle never
marks an order paid. All real Stripe fulfillment still requires a verified webhook.

The mobile order summary is collapsible. The deposit and exclusion of quote-only
services stay visible even while the summary is collapsed.

An end-to-end sandbox card payment through the embedded page was verified:
priced car + unpriced villa, exact 30% deposit, successful return, HTTP 200 webhook,
`deposit_paid` saved, and the villa retained under the same order as `price_follows`.
No real money was charged.

## Enable the local test flow

1. Review and apply `supabase/checkout-test-orders.sql` to the linked database.
   It creates private test-order and test-reservation tables and a server-token-protected RPC.
   It reuses the existing `BLACKLINE_BOOKING_TOKEN` credential check. Browser
   requests without that secret cannot execute order operations. The table has
   RLS enabled and no direct browser access.
2. Keep `STRIPE_SECRET_KEY=sk_test_...` (or a restricted `rk_test_...` key with
   the required Checkout, Product and payment-read permissions) in `.env.local`.
   Do not put secrets in a `NEXT_PUBLIC_` variable or commit them.
3. Install the official Stripe CLI and authenticate to **Blackline Development**.
   Forward sandbox events from a local terminal:

   ```powershell
   stripe login
   stripe listen --events checkout.session.completed,checkout.session.expired,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed --forward-to localhost:3000/api/stripe/webhook
   ```

   Alternatively run `node scripts/stripe-test-listener.mjs` from this folder.
   This uses the configured sandbox key without putting it in command arguments,
   pins the official CLI version and saves the listener signing secret to
   `.env.local` without printing it. Keep the process running while testing.

4. Copy the listener's `whsec_...` value into
   `STRIPE_WEBHOOK_SECRET` in `.env.local`. Keep the listener running.
   The CLI secret differs from a Dashboard endpoint secret.
5. Restart Next.js. Keep `NEXT_PUBLIC_APP_URL=http://localhost:3000` locally.
6. Use the website to add a priced car with dates and a villa to the same cart.
   Check the 30% deposit, remaining 70%, and the villa's excluded price status.
   Pay in Stripe's test checkout using a test card, never a real card.
7. Confirm the webhook returns HTTP 200 and the success page shows the order
   number and `deposit_paid`. Replay the completed event: no second order or fulfillment
   should be created. Also test closing the browser before returning, declining
   payment, expiration, invalid signatures, and unavailable inventory.

## Behavior

- The quote endpoint is read-only. It recomputes prices from published database
  products and checks reservable inventory. Browser totals are ignored.
- Checkout is blocked until both the test API key and signing secret exist.
- Checkout recomputes the price and rejects changes to the reviewed deposit.
- Car/yacht inventory is reserved transactionally with order creation in private test tables, using
  transaction-scoped locks and overlap checks. Live reservations and live quote
  requests are never written by this test integration. A partial cart cannot leave partial holds.
- Checkout expires after 30 minutes; inventory holds last 35 minutes. Expiration
  events release unpaid inventory; already paid orders cannot be downgraded.
- Payment fulfillment verifies Stripe's raw-body signature, test mode, integration,
  order reference, USD currency and exact amount. It runs in a database transaction
  with an order lock. Repeated or reordered events cannot duplicate fulfillment.
- An expired reservation that was cancelled before payment requires manual review.
  The webhook returns non-2xx so the event is not silently discarded.
- Quote-only lines stay in the saved test order. On payment, the order gets
  `quoteStatus: pending`; it does not confirm the unpriced services. These private
  test orders are not included in the existing live admin booking/quote lists.
- Water activities have structured date, hours and units. Only unambiguous fixed
  database prices are payable. Existing `from`, range and starting rates remain
  quote-only. Remove the starting-rate wording in the catalog only when the
  business actually agrees to offer a fixed price.
- Security/host/photography add-ons currently require separate scope and price
  approval and are excluded from the deposit. Their selections are retained.
- The success page only reads order status; payment confirmation does not depend
  on a browser redirect. The order is retrieved through its unguessable Stripe
  session reference and never through a public order-number lookup.
- No custom email, invoice creation, receipt-email request or active Zelle flow is
  implemented. Downloadable Blackline confirmation PDFs are available on the
  redesigned success page. Dashboard email settings are independent of the application.

## Checks

```powershell
node --test tests/*.test.mjs
npx tsc --noEmit
```

Database deployment and an actual sandbox webhook are required before claiming
end-to-end payment verification. Unit tests mock database persistence; they do
not prove remote transaction behavior.

## Confirmation page and PDF

The success page uses a validated Stripe test session and matching saved order.
A verified paid response can reconcile delayed webhook fulfillment through the
same idempotent database operation. Payment received and booking confirmed are
separate states; pending pages refresh automatically for a bounded period.

Product photos, original prices, dates, allocated payments, remaining balances
and quote-only services are shown on screen and in the PDF. Payment allocation
uses integer cents and a largest-remainder split so line amounts match the order
exactly. Product image URLs are snapshotted for newly created orders; older orders
fall back to published catalog photos.

`GET /api/orders/confirmation?session_id=...` validates the same order and session
before rendering a private, uncached PDF attachment. It does not accept an order
number or browser-supplied prices. Only approved public image hosts and files
inside the public directory can supply PDF images; redirects and private URLs
are rejected. The bundled Noto Sans font is licensed under the OFL.
