# Connect Blackline’s social accounts

1. Apply [the social analytics SQL](../supabase/social-analytics.sql) in the Blackline Supabase project. The table uses the existing Blackline administrator policy and stores encrypted connection credentials.
2. Create a 32-byte encryption key with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"` in your own terminal. Save it as `SOCIAL_TOKEN_ENCRYPTION_KEY` in Vercel Production. Replacing the key requires reconnecting both accounts.
3. Configure the developer apps below, then deploy the current code. Keep the provider secrets in Vercel Production. After deployment, sign in at [Blackline Social analytics](https://www.blacklineconcierge.group/admin/marketing) and connect each enabled account.

## Instagram

- Add Instagram API with Instagram Login to a Meta developer app. Add the professional account `@blackline_concierge` to the app and enable `instagram_business_basic` and `instagram_business_manage_insights`.
- In Business Login settings, register `https://www.blacklineconcierge.group/api/admin/social-analytics/instagram/callback` as a redirect URI.
- Add the Instagram App ID and Instagram App Secret as `INSTAGRAM_APP_ID` and `INSTAGRAM_APP_SECRET` in Vercel. [Meta Business Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login) · [Meta Insights](https://developers.facebook.com/documentation/instagram-platform/insights)

## TikTok

- Register a web app in TikTok for Developers. Enable Login Kit and the Display API with `user.info.basic`, `user.info.profile`, `user.info.stats` and `video.list`.
- Register `https://www.blacklineconcierge.group/api/admin/social-analytics/tiktok/callback` in Login Kit. Add `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET` in Vercel.
- Use the TikTok Sandbox to test with `@blacklineconcierge` for the review recording. Follow TikTok’s URL verification and review requirements before switching to production credentials. [Register your app](https://developers.tiktok.com/docs/en/getting-started-create-an-app) · [App review guidelines](https://developers.tiktok.com/docs/en/app-review-guidelines)

The page fetches fresh statistics when opened or refreshed, and renews access when needed during those requests. After an extended period without use, the platform may require a new authorization. Post metrics cover the latest 12 items and reflect the totals returned by each platform.
