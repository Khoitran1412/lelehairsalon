import { DurableObject } from 'cloudflare:workers';
import type { LedgerClaim, LedgerCompletion } from '../lib/booking/notification-ledger';

type LedgerEntry = {
  status: 'claimed' | 'completed';
  claimedAt: number;
  completion?: LedgerCompletion;
};

/**
 * Each deterministic object name represents one approval event or one message
 * channel. A claim is persisted before Twilio is called, which deliberately
 * favours at-most-once notification attempts over accidental duplicates.
 */
export class BookingNotificationLedger extends DurableObject {
  async claim(): Promise<LedgerClaim> {
    const existing = await this.ctx.storage.get<LedgerEntry>('entry');
    if (existing) return { acquired: false, status: existing.status };

    await this.ctx.storage.put<LedgerEntry>('entry', {
      status: 'claimed',
      claimedAt: Date.now(),
    });
    return { acquired: true, status: 'claimed' };
  }

  async complete(completion: LedgerCompletion): Promise<void> {
    const existing = await this.ctx.storage.get<LedgerEntry>('entry');
    if (!existing || existing.status === 'completed') return;

    await this.ctx.storage.put<LedgerEntry>('entry', {
      ...existing,
      status: 'completed',
      completion,
    });
  }
}
