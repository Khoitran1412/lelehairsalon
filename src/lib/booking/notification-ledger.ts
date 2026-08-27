export type LedgerClaim = {
  acquired: boolean;
  status: 'claimed' | 'completed';
};

export type LedgerCompletion = {
  outcome: 'sent' | 'failed' | 'skipped' | 'unknown';
  reason?: string;
  completedAt: string;
};

export interface NotificationLedger {
  claim(key: string): Promise<LedgerClaim>;
  complete(key: string, completion: LedgerCompletion): Promise<void>;
}
