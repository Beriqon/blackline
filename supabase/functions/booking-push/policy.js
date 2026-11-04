export function allowedPushEndpoint(endpoint) {
  try {
    const u = new URL(endpoint);
    return u.protocol === 'https:' && !u.username && !u.password && !u.port && !u.hash && u.pathname !== '/' && (
      ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'].includes(u.hostname) ||
      /^[a-z0-9-]+\.notify\.windows\.com$/.test(u.hostname)
    );
  } catch { return false; }
}
export function pushResult(status) {
  return { done: (status >= 200 && status < 300) || status === 404 || status === 410 };
}
