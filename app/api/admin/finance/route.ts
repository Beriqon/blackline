import { financePeriods, financeRange, summarizeStripeActivity, type FinanceReport } from "@/lib/admin-finance";
import { getStripe } from "@/lib/stripe-client";
import { stripeMode } from "@/lib/stripe-mode";
import { requireAdmin } from "@/lib/supabase-server";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  try {
    if (!await requireAdmin()) {
      return Response.json({ error: "Sign in as an administrator to view Stripe activity." }, { status: 403, headers });
    }

    const days = Number(new URL(request.url).searchParams.get("days") ?? 30);
    if (!financePeriods.some(period => period.days === days)) {
      return Response.json({ error: "Select a supported reporting period." }, { status: 400, headers });
    }
    if (stripeMode() !== "live") {
      return Response.json({ error: "Live Stripe reporting is unavailable while Stripe is in test mode." }, { status: 503, headers });
    }

    const stripe = getStripe();
    if (!stripe) {
      return Response.json({ error: "Stripe is unavailable in this environment." }, { status: 503, headers });
    }

    const { start, end } = financeRange(days);
    const entries = stripe.balanceTransactions.list({
      created: { gte: start, lt: end },
      limit: 100,
    });
    const report: FinanceReport = {
      start,
      end,
      currencies: await summarizeStripeActivity(entries),
    };
    return Response.json(report, { headers });
  } catch (error) {
    console.error("Could not load Stripe finance report", error instanceof Error ? error.name : "Unknown error");
    return Response.json({ error: "Stripe activity could not be loaded. Try refreshing." }, { status: 502, headers });
  }
}
