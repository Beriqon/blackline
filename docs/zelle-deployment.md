# Zelle checkout

Recipient: `blackline235@gmail.com`. This is a real bank transfer; Stripe remains test-only.

Deploy the repository to the hosting project serving `blacklineconcierge.group`. A GitHub push publishes the code only when that repository/branch is connected to the hosting service and deployment succeeds.

The production environment must have the same `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and server-only `BLACKLINE_BOOKING_TOKEN` as the configured Blackline project. Keep Stripe test keys and its webhook secret configured for the existing checkout. Set `NEXT_PUBLIC_APP_URL` to the production HTTPS website URL. Do not commit `.env.local`.

Database SQL already applied to the connected Blackline project:

- `supabase/zelle-resource-availability.sql`
- `supabase/zelle-orders.sql`

For a different Supabase project these must be applied after the existing workspace/checkout schemas. The registered server credential must match `BLACKLINE_BOOKING_TOKEN`.

Screenshots are re-encoded as JPEG and stored in the private `blackline_private.zelle_evidence` database table, not GitHub or the public photo gallery. The authenticated admin image endpoint returns private/no-store responses. General signed-in users and guests cannot read the table or review orders.

After screenshot submission, Zelle uses the same Blackline confirmation design and product-photo cards as card payments. The private `/api/zelle/confirmation?order_id=...` PDF endpoint requires the order's signed browser cookie. Before bank verification, the page and PDF show the submitted amount separately from verified paid ($0), with the hold deadline and the outstanding priced balance. After an administrator confirms receipt, the same page and PDF show the verified payment and correct remaining balance. The new PDF route includes the same bundled font through `outputFileTracingIncludes`.

Selecting Zelle expires the test card session before creating the bank-transfer order. Instructions initially hold inventory for 30 minutes. A valid screenshot submission starts a 72-hour verification hold. Retries do not extend it. Pending holds automatically stop blocking availability at their deadline without a scheduled job. Only an administrator who confirms having checked the bank can confirm/reject. Rejection releases inventory; confirmation secures it. Late confirmation rechecks inventory and fails if another reservation occupies it.

Products without an agreed price remain on the same order and are excluded from the deposit. Their availability is not reserved before a proposal is approved. Activities without a selected start time conservatively reserve their selected Miami calendar day.

Verification: `node --test tests/*.test.mjs` and `npx tsc --noEmit`. `tests/zelle-database.sql` tests synthetic state transitions inside a transaction that always rolls back. Browser verification uses a synthetic screenshot marked “NO PAYMENT SENT”; no real transfer is needed. After deploying, verify HTTPS/cookie behavior and opening the private screenshot while signed in as an administrator.
