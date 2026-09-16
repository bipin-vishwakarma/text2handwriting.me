-- An export purchase is a recoverable entitlement, not a lifetime Pro flag.
-- Keep financial records if a user account is deleted; application access still
-- requires the authenticated user id recorded at purchase time.
create table public.export_purchases (
  id uuid primary key,
  user_id uuid not null,
  receipt text not null unique,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  page_count integer not null check (page_count between 1 and 500),
  amount_paise integer not null check (amount_paise = 1000 + 200 * page_count),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  constraint paid_has_payment check
    ((status = 'pending' and paid_at is null and razorpay_payment_id is null)
      or (status = 'paid' and paid_at is not null and razorpay_order_id is not null and razorpay_payment_id is not null))
);

create index export_purchases_user_created_idx on public.export_purchases (user_id, created_at desc);
alter table public.export_purchases enable row level security;
create policy "Users may read own export purchases" on public.export_purchases
  for select to authenticated using ((select auth.uid()) = user_id);
-- No client write policy: only the service-role Edge Functions may create or grant purchases.
revoke all on public.export_purchases from anon, authenticated;
grant select on public.export_purchases to authenticated;
grant all on public.export_purchases to service_role;

-- Atomic reconciliation. A captured payment may be retried after a function or
-- browser failure, but must never grant another account/order or overwrite a
-- different payment. The Edge Function checks Razorpay independently first.
create function public.grant_export_purchase(
  p_purchase_id uuid,
  p_user_id uuid,
  p_receipt text,
  p_order_id text,
  p_payment_id text,
  p_page_count integer,
  p_amount_paise integer
) returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  purchase public.export_purchases%rowtype;
begin
  if p_order_id is null or p_payment_id is null or p_receipt is null then
    raise exception 'Missing payment identifiers';
  end if;
  select * into purchase from public.export_purchases
    where id = p_purchase_id for update;
  if not found or purchase.user_id <> p_user_id or purchase.receipt <> p_receipt
    or purchase.page_count <> p_page_count or purchase.amount_paise <> p_amount_paise
    or purchase.currency <> 'INR' or
    (purchase.razorpay_order_id is not null and purchase.razorpay_order_id <> p_order_id) then
    raise exception 'Purchase does not match verified payment';
  end if;
  if purchase.status = 'paid' then
    if purchase.razorpay_order_id <> p_order_id or purchase.razorpay_payment_id <> p_payment_id then
      raise exception 'Purchase already granted for another payment';
    end if;
    return purchase.id;
  end if;
  update public.export_purchases set razorpay_order_id = p_order_id,
    razorpay_payment_id = p_payment_id, status = 'paid', paid_at = now()
    where id = purchase.id;
  return purchase.id;
end;
$$;
revoke all on function public.grant_export_purchase(uuid, uuid, text, text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.grant_export_purchase(uuid, uuid, text, text, text, integer, integer) to service_role;
