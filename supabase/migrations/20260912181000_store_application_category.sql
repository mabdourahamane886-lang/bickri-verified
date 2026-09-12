alter table public.badge_applications
  add column if not exists applicant_category text;

create index if not exists badge_applications_applicant_category_idx
  on public.badge_applications (applicant_category);
