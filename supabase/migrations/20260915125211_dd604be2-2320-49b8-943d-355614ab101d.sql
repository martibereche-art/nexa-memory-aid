CREATE OR REPLACE FUNCTION public.is_prime(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = _user_id
      AND s.plan <> 'free'
      AND s.status IN ('active', 'cancelled')
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_prime(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_prime(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_prime(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_prime(uuid) TO service_role;

DROP POLICY IF EXISTS profiles_own ON public.profiles;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY profiles_delete_own ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.is_prime(auth.uid())
      OR (background = 'nexa' AND notify_sound = false)
    )
  );