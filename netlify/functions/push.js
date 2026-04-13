const webpush = require('web-push');
const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL } = process.env;

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_EMAIL) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'VAPID env vars not set' })
    };
  }

  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const store = getStore('subscriptions');
  const { blobs } = await store.list();

  if (blobs.length === 0) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sent: 0, message: 'No subscribers' })
    };
  }

  const payload = JSON.stringify({
    title: 'Push Test',
    body: 'It works! Push received while app closed.'
  });

  let sent = 0;
  const errors = [];

  await Promise.all(
    blobs.map(async ({ key }) => {
      const raw = await store.get(key);
      if (!raw) return;
      try {
        const subscription = JSON.parse(raw);
        await webpush.sendNotification(subscription, payload);
        sent++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired — remove it
          await store.delete(key);
        } else {
          errors.push(err.message);
        }
      }
    })
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sent, errors: errors.length ? errors : undefined })
  };
};
