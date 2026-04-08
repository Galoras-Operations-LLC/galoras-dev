-- Product type definitions — admin-managed list of coach product categories

create table if not exists product_type_definitions (
  id          uuid        primary key default gen_random_uuid(),
  slug        text        not null unique,
  label       text        not null,
  badge_color text        not null default 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
  sort_order  int         not null default 0,
  created_at  timestamptz default now()
);

-- Seed with existing hardcoded types
insert into product_type_definitions (slug, label, badge_color, sort_order) values
  ('diagnostic', 'Diagnostic',    'bg-violet-500/10 border-violet-500/30 text-violet-400', 0),
  ('block',      'Coaching Block','bg-blue-500/10 border-blue-500/30 text-blue-400',       1),
  ('program',    'Programme',     'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', 2),
  ('enterprise', 'Enterprise',    'bg-amber-500/10 border-amber-500/30 text-amber-400',    3)
on conflict (slug) do nothing;

alter table product_type_definitions enable row level security;

create policy "product_types_read_all"
  on product_type_definitions for select using (true);

create policy "product_types_admin_write"
  on product_type_definitions for all using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );
