-- TaskFlow V184: one-round-trip server-only billing status.
create or replace function public.taskflow_paypal_status_snapshot_v184(p_uid text)
returns jsonb language sql stable security invoker set search_path = public, pg_temp
as $fn$
select jsonb_build_object(
'entitlement',(select to_jsonb(e) from public.taskflow_paypal_entitlements e where e.uid=p_uid limit 1),
'trialUsed',(exists(select 1 from public.taskflow_paypal_trial_claims c where c.uid=p_uid) or exists(select 1 from public.taskflow_paypal_subscriptions s where s.uid=p_uid)),
'checkout',(select to_jsonb(i) from public.taskflow_paypal_intents i where i.uid=p_uid and i.checkout_state in ('pending','approved') limit 1)
);
$fn$;
revoke all on function public.taskflow_paypal_status_snapshot_v184(text) from public,anon,authenticated;
grant execute on function public.taskflow_paypal_status_snapshot_v184(text) to service_role;
