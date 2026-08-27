// OpenNext generates this module during the Cloudflare build.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- .open-next is intentionally generated, not committed.
import { default as handler } from './.open-next/worker.js';
import { BookingNotificationLedger } from './src/worker/booking-notification-ledger';

export default {
  fetch: handler.fetch,
} satisfies ExportedHandler<CloudflareEnv>;

// The generated OpenNext worker only supplies the fetch handler. Re-exporting
// this class makes the SQLite-backed notification ledger available to Wrangler.
export { BookingNotificationLedger };
