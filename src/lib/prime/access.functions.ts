import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
export const getPrime = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
 const {data,error}=await context.supabase.from('subscriptions').select('plan,status,started_at,current_period_end,cancel_at_period_end').eq('user_id',context.userId).maybeSingle();
 if(error) throw error;
 const now=Date.now();
 const active=Boolean(data && ['weekly','monthly','yearly'].includes(data.plan) && ['active','cancelled','canceled'].includes(data.status) && data.started_at && Date.parse(data.started_at)<=now && data.current_period_end && Date.parse(data.current_period_end)>now);
 return {active,subscription:data};
});
