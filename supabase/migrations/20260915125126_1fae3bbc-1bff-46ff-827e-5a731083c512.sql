CREATE TABLE public.subscriptions (
  user_id uuid PRIMARY KEY,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'inactive',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  started_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_read_own ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS background text NOT NULL DEFAULT 'nexa',
  ADD COLUMN IF NOT EXISTS notify_sound boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_sound_id text NOT NULL DEFAULT 'nexa',
  ADD COLUMN IF NOT EXISTS notify_volume integer NOT NULL DEFAULT 70;