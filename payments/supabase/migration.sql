-- TaskFlow: PayPal subscription isolation (Supabase Free).
-- No browser client has direct read or write permissions on payment tables.
CREATE TABLE IF NOT EXISTS public.taskflow_paypal_intents (
  intent_id uuid PRIMARY KEY,
  uid text NOT NULL CHECK (char_length(uid) BETWEEN 1 AND 128),
  plan_id text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS taskflow_paypal_intents_expiry_idx
  ON public.taskflow_paypal_intents(expires_at);

CREATE TABLE IF NOT EXISTS public.taskflow_paypal_subscriptions (
  paypal_id text PRIMARY KEY CHECK (char_length(paypal_id) BETWEEN 10 AND 70),
  uid text NOT NULL CHECK (char_length(uid) BETWEEN 1 AND 128),
  plan_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS taskflow_paypal_subscriptions_uid_idx
  ON public.taskflow_paypal_subscriptions(uid);

CREATE TABLE IF NOT EXISTS public.taskflow_paypal_entitlements (
  uid text PRIMARY KEY CHECK (char_length(uid) BETWEEN 1 AND 128),
  subscription_id text NOT NULL UNIQUE REFERENCES public.taskflow_paypal_subscriptions(paypal_id),
  state text NOT NULL DEFAULT 'active' CHECK (state IN ('active','revoked')),
  renewal_status text NOT NULL DEFAULT 'ACTIVE',
  paid_until timestamptz NOT NULL,
  last_paid_at timestamptz NOT NULL,
  last_sale_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS taskflow_paypal_entitlements_active_idx
  ON public.taskflow_paypal_entitlements(paid_until) WHERE state='active';

CREATE TABLE IF NOT EXISTS public.taskflow_paypal_sales (
  paypal_sale_id text PRIMARY KEY CHECK (char_length(paypal_sale_id) BETWEEN 5 AND 100),
  paypal_id text NOT NULL REFERENCES public.taskflow_paypal_subscriptions(paypal_id),
  uid text NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount=6.00),
  state text NOT NULL CHECK (state IN ('completed','reversed')),
  paid_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.taskflow_paypal_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taskflow_paypal_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taskflow_paypal_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taskflow_paypal_sales ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public.taskflow_paypal_intents,
  public.taskflow_paypal_subscriptions,
  public.taskflow_paypal_entitlements,
  public.taskflow_paypal_sales
FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.taskflow_paypal_intents,
  public.taskflow_paypal_subscriptions,
  public.taskflow_paypal_entitlements,
  public.taskflow_paypal_sales
TO service_role;
