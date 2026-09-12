-- Bickri Verified / Badge Vert Africain
create extension if not exists pgcrypto;

do $$ begin
  create type public.organization_status as enum ('pending','approved','suspended');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.application_status as enum ('submitted','under_review','approved','rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(trim(name)) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'), description text not null default '', country text not null,
  city text, category text not null check (category in ('agriculture','énergie','déchets','eau','mobilité','autre')),
  website_url text, logo_url text, status public.organization_status not null default 'pending',
  badge_issued_at timestamptz, badge_expires_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.badge_criteria (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, description text not null,
  position smallint not null check (position > 0), active boolean not null default true
);
create table if not exists public.badge_applications (
  id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete cascade,
  applicant_name text not null, applicant_email text not null, evidence_url text, impact_summary text not null,
  status public.application_status not null default 'submitted', reviewer_notes text, submitted_at timestamptz not null default now(), reviewed_at timestamptz
);
create table if not exists public.organization_criteria (
  organization_id uuid references public.organizations(id) on delete cascade,
  criterion_id uuid references public.badge_criteria(id) on delete cascade,
  score smallint check (score between 0 and 100), evidence text,
  primary key (organization_id, criterion_id)
);
create index if not exists organizations_status_idx on public.organizations(status);
create index if not exists organizations_category_idx on public.organizations(category);
create index if not exists applications_status_idx on public.badge_applications(status);

alter table public.organizations enable row level security;
alter table public.badge_criteria enable row level security;
alter table public.badge_applications enable row level security;
alter table public.organization_criteria enable row level security;

drop policy if exists "approved organizations are publicly readable" on public.organizations;
create policy "approved organizations are publicly readable" on public.organizations for select to anon,authenticated using (status='approved');
drop policy if exists "active criteria are publicly readable" on public.badge_criteria;
create policy "active criteria are publicly readable" on public.badge_criteria for select to anon,authenticated using (active=true);
drop policy if exists "anyone can submit an application" on public.badge_applications;
create policy "anyone can submit an application" on public.badge_applications for insert to anon,authenticated with check (true);
drop policy if exists "scores of approved organizations are publicly readable" on public.organization_criteria;
create policy "scores of approved organizations are publicly readable" on public.organization_criteria for select to anon,authenticated using (exists(select 1 from public.organizations o where o.id=organization_id and o.status='approved'));

insert into public.badge_criteria(code,name,description,position) values
('impact_reduction','Réduction de l’impact','Actions mesurables pour réduire les impacts et préserver les ressources.',1),
('circular_economy','Économie circulaire','Réemploi, valorisation et nouveaux usages des ressources.',2),
('collective_impact','Impact collectif','Solutions inclusives bénéficiant durablement aux communautés.',3)
on conflict(code) do nothing;
