-- Partial payment tracking and reminder fields for fee_payments

ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS amount_paid INT DEFAULT 0;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS amount_due INT DEFAULT 0;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS reminder_count INT DEFAULT 0;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Backfill amount_due from amount_sek for existing rows
UPDATE fee_payments
SET amount_due = amount_sek
WHERE amount_due IS NULL OR amount_due = 0;

-- Backfill amount_paid for legacy paid rows
UPDATE fee_payments
SET amount_paid = amount_sek
WHERE status = 'paid' AND (amount_paid IS NULL OR amount_paid = 0);

-- Normalize legacy status values (payment_status enum: pending, paid, overdue, waived)
-- pending = unpaid or partially paid; derive display status from amount_paid in app layer

CREATE INDEX IF NOT EXISTS idx_fee_payments_status ON fee_payments(club_id, status);
