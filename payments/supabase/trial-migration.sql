-- TaskFlow: one verified 7-day PayPal trial per Firebase UID.
-- Existing paid entitlements remain valid and unchanged.
ALTER TABLE public.taskflow_paypal_entitlements
 ADD COLUMN IF NOT EXISTS access_kind text NOT NULL DEFAULT 'paid'
 CHECK (access_kind IN ('paid','trial'));
ALTER TABLE public.taskflow_paypal_entitlements
 ADD COLUMN IF NOT EXISTS trial_started_at timestamptz;
ALTER TABLE public.taskflow_paypal_entitlements
 ALTER COLUMN last_paid_at DROP NOT NULL;

CREATE TABLE IF NOT EXISTS public.taskflow_paypal_trial_claims (
 uid text PRIMARY KEY CHECK (char_length(uid) BETWEEN 1 AND 128),
 subscription_id text NOT NULL UNIQUE
 REFERENCES public.taskflow_paypal_subscriptions(paypal_id),
 claimed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.taskflow_paypal_trial_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.taskflow_paypal_trial_claims
 FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
 public.taskflow_paypal_trial_claims TO service_role;
