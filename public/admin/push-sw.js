/* No fetch handler: private dashboard responses are never cached offline. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data?.json() ?? {}; } catch { /* Display a safe fallback. */ }
  const url = typeof data.url === 'string' && data.url.startsWith('/admin/dashboard') ? data.url : '/admin/dashboard?view=bookings';
  event.waitUntil(self.registration.showNotification(data.title || 'New Blackline booking', {
    body: data.body || 'Open your secure dashboard to view the details.',
    icon: '/admin/icon-192.png', badge: '/admin/icon-192.png',
    tag: data.tag || 'blackline-booking', data: { url },
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/admin/dashboard?view=bookings', self.location.origin);
  if (url.origin !== self.location.origin || url.pathname !== '/admin/dashboard') return;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const dashboard = windows.find(client => new URL(client.url).pathname.startsWith('/admin/'));
    if (dashboard) { await dashboard.navigate(url.href); await dashboard.focus(); }
    else await self.clients.openWindow(url.href);
  })());
});
