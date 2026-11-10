# Blackline workspace

## Supplier management setup

Supplier management is currently a non-saving preview: `supplierStorageEnabled` in `components/admin-suppliers.tsx` is disabled, database reads/writes are skipped, and the save action is disabled. Enable it only after applying and verifying the database setup. The supplier directory uses `public.suppliers`. Apply `suppliers.sql` once to the linked Blackline project before using the page. This schema is prepared locally and has not yet been applied: the current Supabase connector cannot access the linked project. The table uses the existing administrator membership check and timestamp-based conflict detection. Anonymous users cannot access supplier contact details or costs. Suppliers can be marked Inactive; the UI preserves their records instead of deleting them. Product rates are internal USD reference costs, with a separate rate basis and tax-included/excluded flag. They do not change retail prices or automatically assign suppliers or costs to bookings.

The application uses Supabase Postgres and Storage. The linked project already has the schema, 275 catalog products, five photo galleries and initial settings. Existing product images remain deployable static assets referenced by the catalog; new uploads go to the `website-media` bucket.

`schema.sql`, `booking-availability.sql` and `shared-vehicle-availability.sql` document the applied schema. Do not run them again on the existing project. The Supabase MCP migration history records the applied migrations. `scripts/export-database-seed.cjs` regenerates idempotent catalog/settings seed SQL for a fresh environment; it never imports demo bookings or browser preview data.

## Environment

Copy `.env.example` to `.env.local` for another environment and fill in the project URL and publishable key. The current local environment is already configured. Keep `.env.local` private.

The public key is constrained by RLS. The browser may read published products, promotion settings and photo galleries. Administrator records, customers, bookings, affiliates and business/workspace settings are private. Administrative writes require a signed-in account present in `admin_members`. There is no preview bypass.

The server's `BLACKLINE_BOOKING_TOKEN` is a random secret, whose SHA-256 digest is registered in `blackline_private.server_credentials`. The server RPC accepts only explicit checkout and quote operations and verifies this secret before accessing private records. Never publish the token or put it in browser code. For a new environment generate a random 48-byte secret, register only its SHA-256 digest through a database administrator, and set the raw secret only in the server environment. Availability exposes occupied intervals without customer details. Database triggers serialize reservations and reject conflicting dates across online and manual bookings.

## Administrator activation

`blackline235@gmail.com` is the sole approved administrator. Its Auth account is prepared without a password and remains unconfirmed. No invitation, confirmation email or password-reset message has been sent during development. Do not enable public signup or add other administrator addresses as a testing shortcut.

The owner can visit `/admin/activate`, type the approved email and explicitly submit to request the existing signup-confirmation email. `/admin/forgot-password` requests password recovery for the same address. Merely visiting either page never sends an email. The server enforces the address, intent, origin and cooldown; Supabase also applies its own mail rate limits. Both emails return to `https://www.blacklineconcierge.group/admin/set-password`, where a verified email link and the correct confirmed identity are required before setting a password. Tokens are removed from the URL; the user signs in again after setting the password. The current default Supabase confirmation links use the implicit email flow; PKCE codes and token-hash templates are also supported by the password page.

Verified Supabase dashboard configuration:

- Site URL is `https://www.blacklineconcierge.group`.
- The exact Redirect URL `https://www.blacklineconcierge.group/admin/set-password` is saved.
- Confirm signup and Reset password templates both retain `{{ .ConfirmationURL }}`.
- Custom SMTP is disabled; the built-in Supabase mail service is currently used.

Before sharing the production activation page:

- Deploy these local application changes on `https://www.blacklineconcierge.group`.
- Configure/verify SMTP so mail can reach the approved owner address. The default Supabase mail service restricts recipients and is not a substitute for production SMTP: https://supabase.com/docs/guides/auth/auth-smtp .

These settings were checked through the signed-in Supabase dashboard. All mail tests use a mock provider; valid real email requests are deliberately excluded. A read-only Auth check confirmed that confirmation and recovery emails have not been requested. Actual mail delivery and the complete emailed-link flow remain untested at the owner's request.

## Verification

Run `node --experimental-strip-types --test tests/catalog-live.test.mjs tests/booking-time.test.mjs` for catalog projection tests and `npx tsc --noEmit` for TypeScript checks. Public/private RLS, administrator CRUD, unauthorized writes, the server credential check, and conflicting manual reservations were also checked in a database transaction that was rolled back. Public service routes and availability were checked over local HTTP; private owner APIs return 401 without an administrator session.

## Booking push notifications

The `booking-push` Edge Function and the `blackline-booking-push` Cron job are deployed. `push-notifications.sql` records the applied schema. VAPID keys and the scheduler credential are stored in Supabase Vault as `blackline_push_config`; never export its decrypted contents to client code or source control. The browser receives only the public key after administrator authentication. No new website environment variables are required for push.

Publish the local application changes before the owner sets up the production device. Open Settings → Notifications, turn alerts on, accept browser permission, then send a test. The setting is per browser/device. An iPhone/iPad requires iOS/iPadOS 16.4+ and installation through Safari → Share → Add to Home Screen; open the installed app before enabling alerts. The page always includes setup, blocked-permission and operating-system troubleshooting instructions. Browsers do not allow a website to directly open or change their permission settings.

New manual bookings, confirmed checkout bookings (`paid`, `deposit_paid`, `owner_reserved`) and new quote requests enqueue generic alerts with a link to Bookings. Pending payment holds do not trigger alerts. No old records are backfilled when a device subscribes. A database transaction creates the booking and its delivery records together. Cron processes due deliveries each minute; actual arrival also depends on the browser, network and device settings. The dashboard tab can be closed, but some desktop browsers must keep running in the background.

The private delivery queue uses leases, retries, a 24-hour expiry, per-device/event deduplication and notification tags. Invalid/expired endpoints are disabled. Turning off a device cancels its queued deliveries; an already accepted/in-flight push may still arrive. Old delivery records are removed after seven days. The worker rejects unapproved push-service hosts and redirects, preventing subscriptions from being used to access private network addresses. Device RPCs check administrator membership and ownership. The service worker has no fetch handler and never caches private dashboard responses. RLS on the private queue intentionally has no client policy; service-role worker access goes through a restricted RPC. The authenticated SECURITY DEFINER device RPC is intentional and checks `auth.uid()` and administrator membership before any operation.

Verification: `node --test tests/push-notifications.test.mjs` checks endpoint restrictions, delivery retries, service-worker display/click behavior and the complete worker handler with a mocked provider. Registration, cooldown, disable cancellation and unauthorized access were checked in a database transaction and rolled back. The deployed worker's read-only health endpoint was checked. No real device is subscribed and no push has been sent. Automatic approval review rejected a live dispatch test because it could reach real devices; use the owner's explicit Send test notification action after sign-in and publication to verify actual device delivery.

Stripe checkout still requires its own server credentials. Connecting data storage does not activate payments or automated customer messages. WhatsApp/email actions open a draft for the administrator to send.
