-- One unclosed checkout per linked account. Existing agreements remain valid.
alter table public.taskflow_paypal_intents
  add column if not exists agreement_id text,
  add column if not exists starts_at timestamptz,
  add column if not exists checkout_state text
    check (checkout_state in ('pending', 'approved', 'closed'));
create unique index if not exists taskflow_paypal_one_checkout
  on public.taskflow_paypal_intents(uid) where checkout_state in ('pending','approved');
create unique index if not exists taskflow_paypal_intent_agreement
  on public.taskflow_paypal_intents(agreement_id) where agreement_id is not null;

create or replace function public.taskflow_reserve_checkout(p_uid text, p_plan text, p_start timestamptz)
returns public.taskflow_paypal_intents
language plpgsql security invoker set search_path = '' as $$
declare
  intent public.taskflow_paypal_intents;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_uid,165));
  select * into intent from public.taskflow_paypal_intents
    where uid=p_uid and checkout_state in ('pending','approved') for update;
  if found then
    return intent;
  end if;
  insert into public.taskflow_paypal_intents(intent_id,uid,plan_id,starts_at,expires_at,checkout_state)
    values(gen_random_uuid(),p_uid,p_plan,p_start,now()+interval '30 minutes','pending')
    returning * into intent;
  return intent;
end;
$$;
revoke all on function public.taskflow_reserve_checkout(text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.taskflow_reserve_checkout(text,text,timestamptz) to service_role;

-- Only a verified payment from the current (or newer) agreement can replace access.
create or replace function public.taskflow_apply_access(p_uid text,p_id text,p_kind text,p_status text,
  p_until timestamptz,p_paid timestamptz,p_trial timestamptz,p_sale text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  previous public.taskflow_paypal_entitlements;
  agreement public.taskflow_paypal_subscriptions;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_uid,165));
  select * into strict agreement from public.taskflow_paypal_subscriptions where paypal_id=p_id and uid=p_uid;
  select * into previous from public.taskflow_paypal_entitlements where uid=p_uid for update;
  if p_until <= now() or (p_kind='paid' and p_paid is null) then return false; end if;
  if previous.subscription_id is not null then
    if previous.subscription_id <> p_id then
      if exists(select 1 from public.taskflow_paypal_subscriptions where paypal_id=previous.subscription_id
          and created_at>=agreement.created_at)
        or (previous.state='active' and previous.paid_until>now() and previous.renewal_status<>'CANCELLED')
        then return false; end if;
    else
      if previous.access_kind='paid' and p_kind='trial' or
         previous.state='revoked' and (p_kind='trial' or coalesce(previous.last_paid_at,'-infinity')>=p_paid)
         or previous.last_paid_at>p_paid then return false; end if;
      p_until:=greatest(p_until,previous.paid_until);
      if previous.renewal_status='CANCELLED' then p_status:='CANCELLED'; end if;
    end if;
  end if;
  insert into public.taskflow_paypal_entitlements as ent
    (uid,subscription_id,state,access_kind,renewal_status,paid_until,last_paid_at,trial_started_at,last_sale_id,updated_at)
  values(p_uid,p_id,'active',p_kind,p_status,p_until,p_paid,coalesce(p_trial,previous.trial_started_at),
    coalesce(p_sale,case when previous.subscription_id=p_id then previous.last_sale_id end),now())
  on conflict(uid) do update set subscription_id=excluded.subscription_id,state=excluded.state,
    access_kind=excluded.access_kind,renewal_status=excluded.renewal_status,paid_until=excluded.paid_until,
    last_paid_at=excluded.last_paid_at,trial_started_at=excluded.trial_started_at,last_sale_id=excluded.last_sale_id,updated_at=now();
  return true;
end;
$$;
revoke all on function public.taskflow_apply_access(text,text,text,text,timestamptz,timestamptz,timestamptz,text) from public,anon,authenticated;
grant execute on function public.taskflow_apply_access(text,text,text,text,timestamptz,timestamptz,timestamptz,text) to service_role;

-- Store the settled gross amount, including tax when the merchant adds it at checkout.
alter table public.taskflow_paypal_sales drop constraint taskflow_paypal_sales_amount_check,
  add constraint taskflow_paypal_sales_amount_check check (amount between 6.00 and 12.00);
