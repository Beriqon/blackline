# Stripe live launch

Code and database support both modes. The default remains **test**. No live key was entered, no real payment was made, and no deployment was performed during implementation.

## Production hosting variables

Set these on the production hosting project, not in GitHub source code. Keep test keys on localhost and preview deployments.

```dotenv
STRIPE_MODE=live
STRIPE_LIVE_ENABLED=true
STRIPE_SECRET_KEY=<live secret or restricted server key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<pk_live_... from the same account>
STRIPE_WEBHOOK_SECRET=<whsec_... from the production webhook endpoint>
NEXT_PUBLIC_APP_URL=https://www.blacklineconcierge.group
```

Keep the existing Supabase URL, publishable key and server-only `BLACKLINE_BOOKING_TOKEN`. Never paste secrets into chat, commit them or prefix server secrets with `NEXT_PUBLIC_`.

`STRIPE_LIVE_ENABLED` is an activation gate. Until the webhook and hosting variables are ready, keep it `false`. A live key by itself cannot enable payments. Live mode requires a matching publishable key and a public HTTPS root URL. Vercel preview/development environments are refused. Rebuild and redeploy after changing public keys.

Run `npm run payments:check` locally to validate current configuration, or `npm run payments:check -- --require-live` in an environment containing production variables. It never prints key values or makes a charge. This command does not validate Stripe account capabilities or endpoint delivery.

## Permanent webhook

Create a **live**, **Your account**, **Snapshot** webhook destination in Stripe Workbench:

`https://www.blacklineconcierge.group/api/stripe/webhook`

Use the SDK-compatible API version `2026-03-25.dahlia` and these events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

Copy that endpoint's signing secret into production hosting. Do not use the local CLI listener's secret. The live endpoint rejects test-mode events; local/test mode rejects live events.

## Storage and availability

Applied migrations: `supabase/stripe-live.sql` and `supabase/stripe-live-balances.sql`.

- Private live orders are separate from private test orders.
- Real car/yacht and activity holds use the same production inventory as Zelle and manual reservations.
- Confirmed live orders appear once under their order number in the admin feed. Child inventory rows are not displayed as duplicate bookings.
- Quotes remain unpriced and outside totals.
- Restpayments settle the correct live or test parent and preserve confirmed inventory.
- A late payment that cannot reclaim its availability is recorded as `payment_review`. The guest sees payment received with concierge review required. Admin sees the paid amount and the conflict. Arrange a resolution or refund manually in Stripe; no automatic refund is attempted.
- Switching to full payment or Zelle expires card collection first. A superseded checkout cannot cancel its replacement reservation.

## Before activation

1. Deploy with live payments disabled until the variables and webhook destination are configured.
2. Confirm Stripe permits the business account to accept payments. Choose the live payment methods; Klarna is excluded for deposits and permitted for full priced payments and full remaining balances.
3. Register the actual payment domain in Stripe payment method domains where required for wallets/Link.
4. Verify webhook delivery, the online checkout, admin booking/customer linkage and fresh PDF generation on the hosted release. Use sandbox/test keys for payment simulations.
5. Ensure Blackline has a working manual process for refunds, cancellations and resolving availability-review cases. The integration does not automatically issue refunds or release inventory when an order is moved to Trash.
6. Enable live payments only after the hosted checks succeed. Do not perform artificial live charges as sandbox tests.

## Validation completed

- Unit/integration tests for default-off activation, wrong-key environments, live checkout metadata, server-priced amounts, receipt routing and environment isolation.
- Transactional database fixtures verified production holds, overlapping-order rejection, Zelle conflicts, upgrade retries, live restpayments and late-paid inventory review. All fixtures were rolled back; no real customers were modified.
- Existing Stripe sandbox and Zelle flows remain covered by the test suite.

Official references: https://docs.stripe.com/get-started/checklist/go-live · https://docs.stripe.com/webhooks · https://docs.stripe.com/payments/payment-methods/pmd-registration
