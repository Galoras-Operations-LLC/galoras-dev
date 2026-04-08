-- ============================================================
-- Migration: tags schema (Phase 1)
-- ============================================================

-- 1. tags table
create table if not exists public.tags (
  id           uuid primary key default gen_random_uuid(),
  tag_key      text not null unique,
  tag_label    text not null,
  tag_family   text not null,  -- specialty|audience|outcome|format|industry|credential|style|enterprise|availability|product_type
  is_active    boolean not null default true,
  display_order int not null default 0,
  created_at   timestamptz default now()
);
create index if not exists idx_tags_family on public.tags(tag_family) where is_active = true;

alter table public.tags enable row level security;

create policy "tags_public_read"
  on public.tags for select
  using (true);

create policy "tags_admin_write"
  on public.tags for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

-- 2. coach_tag_map
create table if not exists public.coach_tag_map (
  coach_id uuid not null references public.coaches(id) on delete cascade,
  tag_id   uuid not null references public.tags(id) on delete cascade,
  primary key (coach_id, tag_id)
);
create index if not exists idx_coach_tag_map_coach on public.coach_tag_map(coach_id);
create index if not exists idx_coach_tag_map_tag   on public.coach_tag_map(tag_id);

alter table public.coach_tag_map enable row level security;

create policy "coach_tag_map_public_select"
  on public.coach_tag_map for select
  using (true);

create policy "coach_tag_map_coach_manage"
  on public.coach_tag_map for all
  using (
    exists (
      select 1 from public.coaches
      where coaches.id = coach_tag_map.coach_id
        and coaches.user_id = auth.uid()
    )
  );

create policy "coach_tag_map_admin_all"
  on public.coach_tag_map for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

-- 3. product_tag_map
create table if not exists public.product_tag_map (
  product_id uuid not null references public.coach_products(id) on delete cascade,
  tag_id     uuid not null references public.tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

alter table public.product_tag_map enable row level security;

create policy "product_tag_map_public_select"
  on public.product_tag_map for select
  using (true);

create policy "product_tag_map_coach_manage"
  on public.product_tag_map for all
  using (
    exists (
      select 1 from public.coach_products
      join public.coaches on coaches.id = coach_products.coach_id
      where coach_products.id = product_tag_map.product_id
        and coaches.user_id = auth.uid()
    )
  );

create policy "product_tag_map_admin_all"
  on public.product_tag_map for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

-- 4. coach_applications columns
alter table public.coach_applications
  add column if not exists specialty_tags   text[],
  add column if not exists audience_tags    text[],
  add column if not exists style_tags       text[],
  add column if not exists industry_tags    text[],
  add column if not exists availability_tag text,
  add column if not exists enterprise_tags  text[],
  add column if not exists credential_tags  text[],
  add column if not exists pending_product  jsonb;

-- 5. Seed tags
insert into public.tags (tag_key, tag_label, tag_family, display_order) values
  -- specialty
  ('leadership_development',  'Leadership Development',       'specialty', 0),
  ('executive_coaching',      'Executive Coaching',           'specialty', 1),
  ('career_transitions',      'Career Transitions',           'specialty', 2),
  ('performance_coaching',    'Performance Coaching',         'specialty', 3),
  ('mindset_resilience',      'Mindset & Resilience',         'specialty', 4),
  ('communication_presence',  'Communication & Presence',     'specialty', 5),
  ('team_dynamics',           'Team Dynamics',                'specialty', 6),
  ('startup_founder',         'Startup & Founder Coaching',   'specialty', 7),
  ('wellbeing',               'Wellbeing & Stress Management','specialty', 8),
  ('diversity_inclusion',     'Diversity & Inclusion',        'specialty', 9),

  -- audience
  ('c_suite',                 'C-Suite Executives',           'audience', 0),
  ('senior_leaders',          'Senior Leaders (VP/Director)', 'audience', 1),
  ('mid_managers',            'Mid-Level Managers',           'audience', 2),
  ('founders',                'Founders & Entrepreneurs',     'audience', 3),
  ('individual_contributors', 'Individual Contributors',      'audience', 4),
  ('teams',                   'Teams & Groups',               'audience', 5),
  ('career_changers',         'Career Changers',              'audience', 6),
  ('graduates',               'New Graduates',                'audience', 7),

  -- outcome
  ('clarity',               'Clarity & Direction',            'outcome', 0),
  ('confidence',            'Confidence & Self-Belief',       'outcome', 1),
  ('promotion_readiness',   'Promotion Readiness',            'outcome', 2),
  ('better_communication',  'Better Communication',           'outcome', 3),
  ('team_performance',      'Team Performance',               'outcome', 4),
  ('career_pivot',          'Career Pivot',                   'outcome', 5),
  ('work_life_balance',     'Work-Life Balance',              'outcome', 6),
  ('accountability',        'Accountability & Follow-Through','outcome', 7),
  ('strategic_thinking',    'Strategic Thinking',             'outcome', 8),
  ('resilience',            'Resilience & Stress Management', 'outcome', 9),

  -- format
  ('one_to_one',         '1:1 Coaching',         'format', 0),
  ('group_coaching',     'Group Coaching',        'format', 1),
  ('workshop',           'Workshop',              'format', 2),
  ('online_remote',      'Online / Remote',       'format', 3),
  ('in_person',          'In-Person',             'format', 4),
  ('hybrid',             'Hybrid',                'format', 5),
  ('intensive_retreat',  'Intensive / Retreat',   'format', 6),

  -- industry
  ('technology',           'Technology',                     'industry', 0),
  ('finance',              'Finance & Banking',              'industry', 1),
  ('healthcare',           'Healthcare',                     'industry', 2),
  ('professional_services','Professional Services',          'industry', 3),
  ('media_creative',       'Media & Creative',               'industry', 4),
  ('government',           'Government & Public Sector',     'industry', 5),
  ('nonprofit',            'Non-Profit',                     'industry', 6),
  ('retail_consumer',      'Retail & Consumer',              'industry', 7),
  ('education',            'Education',                      'industry', 8),
  ('manufacturing',        'Manufacturing & Industrial',     'industry', 9),

  -- credential
  ('icf_pcc',          'ICF PCC',             'credential', 0),
  ('icf_mcc',          'ICF MCC',             'credential', 1),
  ('icf_acc',          'ICF ACC',             'credential', 2),
  ('emcc_accredited',  'EMCC Accredited',     'credential', 3),
  ('gcma',             'GCMA',                'credential', 4),
  ('mbti',             'MBTI Practitioner',   'credential', 5),
  ('hogan',            'Hogan Practitioner',  'credential', 6),
  ('disc',             'DISC Certified',      'credential', 7),
  ('other_credential', 'Other Credential',    'credential', 8),

  -- style
  ('directive',             'Directive',             'style', 0),
  ('non_directive',         'Non-Directive',          'style', 1),
  ('strengths_based',       'Strengths-Based',        'style', 2),
  ('solution_focused',      'Solution-Focused',       'style', 3),
  ('psychodynamic',         'Psychodynamic',          'style', 4),
  ('cognitive_behavioural', 'Cognitive-Behavioural',  'style', 5),
  ('narrative',             'Narrative',              'style', 6),
  ('systemic',              'Systemic',               'style', 7),
  ('somatic',               'Somatic',                'style', 8),
  ('mindfulness_based',     'Mindfulness-Based',      'style', 9),

  -- enterprise
  ('enterprise_ready',    'Enterprise Ready',      'enterprise', 0),
  ('team_coaching',       'Team Coaching',         'enterprise', 1),
  ('org_development',     'Org Development',       'enterprise', 2),
  ('leadership_programs', 'Leadership Programs',   'enterprise', 3),
  ('exec_education',      'Executive Education',   'enterprise', 4),
  ('change_management',   'Change Management',     'enterprise', 5),

  -- availability
  ('taking_clients',      'Taking New Clients',          'availability', 0),
  ('limited_availability','Limited Availability',        'availability', 1),
  ('waitlist_only',       'Waitlist Only',               'availability', 2),
  ('not_available',       'Not Currently Available',     'availability', 3),

  -- product_type
  ('single_session',    'Single Session',        'product_type', 0),
  ('coaching_package',  'Coaching Package',      'product_type', 1),
  ('intensive',         'Intensive',             'product_type', 2),
  ('group_program',     'Group Program',         'product_type', 3),
  ('workshop_event',    'Workshop / Event',      'product_type', 4),
  ('corporate',         'Corporate Engagement',  'product_type', 5)

on conflict (tag_key) do nothing;
