import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import webpush from 'npm:web-push@3.6.7';
import { timingSafeEqual } from 'node:crypto';
import { allowedPushEndpoint, pushResult } from './policy.js';

const db = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false, autoRefreshToken: false },
});
async function rpc(action, input = {}) {
  const { data, error } = await db.rpc('blackline_push_worker', { action, input });
  if (error) throw new Error('Push database operation failed');
  return data;
}
Deno.serve(async (req) => {
  if (req.method === 'GET') return Response.json({ service: 'booking-push', ready: true });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const token = req.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
  if (!/^[a-f0-9]{64}$/.test(token)) return new Response('Unauthorized', { status: 401 });
  try {
    const config = await rpc('config');
    if (!config || token.length !== config.dispatchSecret.length || !timingSafeEqual(new TextEncoder().encode(token), new TextEncoder().encode(config.dispatchSecret))) {
      return new Response('Unauthorized', { status: 401 });
    }
    const jobs = await rpc('claim');
    const results = await Promise.all(jobs.map(async (job) => {
      let status = 0;
      if (!allowedPushEndpoint(job.subscription.endpoint)) status = 410;
      else {
        try {
          const request = webpush.generateRequestDetails(job.subscription, JSON.stringify(job.payload), {
            vapidDetails: { subject: 'mailto:blackline235@gmail.com', publicKey: config.publicKey, privateKey: config.privateKey },
            TTL: 86400, urgency: 'high',
          });
          const response = await fetch(request.endpoint, {
            method: 'POST', headers: request.headers, body: request.body,
            redirect: 'error', signal: AbortSignal.timeout(10000),
          });
          status = response.status;
          await response.body?.cancel();
        } catch { /* A timed-out delivery is retried; notification tags coalesce duplicates. */ }
      }
      await rpc('finish', { id: job.id, lease: job.lease, status, ...pushResult(status) });
      return status;
    }));
    return Response.json({ processed: results.length, accepted: results.filter(s => s >= 200 && s < 300).length });
  } catch {
    console.error('Booking push worker failed; pending deliveries remain available for retry.');
    return new Response('Push processing failed', { status: 500 });
  }
});
