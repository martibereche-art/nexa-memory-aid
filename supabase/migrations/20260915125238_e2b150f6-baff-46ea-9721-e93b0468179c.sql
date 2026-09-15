DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

DROP FUNCTION IF EXISTS public.is_prime(uuid);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      (background = 'nexa' AND notify_sound = false)
      OR EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.user_id = auth.uid()
          AND s.plan <> 'free'
          AND s.status IN ('active', 'cancelled')
          AND (s.current_period_end IS NULL OR s.current_period_end > now())
      )
    )
  );