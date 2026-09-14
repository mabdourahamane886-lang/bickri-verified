-- Bickri Verified: production verification flow hardening
-- Adds uniqueness to public badge identifiers, removes public access to private requests,
-- and makes approval/rejection create and maintain the public verified identity.

create unique index if not exists public_verified_profiles_badge_serial_uidx
  on public.public_verified_profiles(badge_serial);

create unique index if not exists public_verified_profiles_slug_uidx
  on public.public_verified_profiles(public_url_slug);

create unique index if not exists organizations_public_id_uidx
  on public.organizations(public_id) where public_id is not null;

create unique index if not exists organizations_badge_serial_uidx
  on public.organizations(badge_serial) where badge_serial is not null;

drop policy if exists "public read own submitted request" on public.verification_requests;

create or replace function public.approve_verification_request(p_request_id uuid, p_reviewed_by uuid default null)
returns public.verification_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.verification_requests;
  v_serial text;
  v_slug text;
  v_org_id uuid;
begin
  select * into r from public.verification_requests where id = p_request_id for update;
  if not found then raise exception 'Verification request not found'; end if;
  if r.status = 'approved' then return r; end if;

  v_serial := coalesce(r.badge_serial, 'BV-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)));
  v_slug := lower(regexp_replace(r.applicant_name,'[^a-zA-Z0-9]+','-','g')) || '-' || lower(substr(replace(gen_random_uuid()::text,'-',''),1,8));

  update public.verification_requests
  set status='approved', reviewed_at=now(), reviewed_by=p_reviewed_by,
      badge_serial=v_serial, verification_score=coalesce(verification_score,100)
  where id=p_request_id
  returning * into r;

  v_org_id := r.organization_id;
  if v_org_id is null then
    insert into public.organizations(
      name, slug, description, country, category, website_url, status,
      badge_issued_at, badge_expires_at, owner_id, public_id, badge_serial,
      verification_score, verified_at
    ) values (
      r.applicant_name, left(v_slug, 150), coalesce(r.reason,''),
      coalesce(r.country_code,'Afrique'), 'autre', r.website, 'approved',
      now(), null, r.applicant_user_id, v_serial, v_serial,
      r.verification_score, now()
    ) returning id into v_org_id;
    update public.verification_requests set organization_id=v_org_id where id=r.id returning * into r;
  else
    update public.organizations
    set name=r.applicant_name, country=coalesce(r.country_code,country),
        website_url=coalesce(r.website,website_url), status='approved',
        badge_issued_at=coalesce(badge_issued_at,now()), badge_serial=v_serial,
        public_id=coalesce(public_id,v_serial), verification_score=coalesce(r.verification_score,100),
        verified_at=now(), updated_at=now()
    where id=v_org_id;
  end if;

  if r.applicant_user_id is not null then
    insert into public.organization_members(organization_id,user_id,role)
    values(v_org_id,r.applicant_user_id,'owner')
    on conflict (organization_id,user_id) do nothing;
    insert into public.notifications(user_id,kind,title,message)
    values(r.applicant_user_id,'verification','Badge Bickri Verified attribué','Votre demande de vérification a été approuvée. Votre badge est maintenant vérifiable publiquement.');
  end if;

  insert into public.public_verified_profiles(request_id,display_name,country_code,badge_serial,verification_score,public_url_slug,active)
  values(r.id,r.applicant_name,r.country_code,r.badge_serial,r.verification_score,v_slug,true)
  on conflict(request_id) do update set display_name=excluded.display_name,
    country_code=excluded.country_code,badge_serial=excluded.badge_serial,
    verification_score=excluded.verification_score,public_url_slug=excluded.public_url_slug,active=true;

  insert into public.verification_events(organization_id,actor_id,action,notes)
  values(v_org_id,p_reviewed_by,'approved','Badge vert Bickri Verified attribué et profil public activé.');

  return r;
end;
$$;

create or replace function public.reject_verification_request(p_request_id uuid, p_reason text, p_reviewed_by uuid default null)
returns public.verification_requests
language plpgsql
security definer
set search_path = public
as $$
declare r public.verification_requests; v_org_id uuid;
begin
  update public.verification_requests set status='rejected', reviewed_at=now(), reviewed_by=p_reviewed_by, rejection_reason=p_reason
  where id=p_request_id returning * into r;
  if not found then raise exception 'Verification request not found'; end if;
  v_org_id := r.organization_id;
  if v_org_id is not null then
    update public.organizations set status='suspended', updated_at=now() where id=v_org_id;
    update public.public_verified_profiles set active=false where request_id=r.id;
    insert into public.verification_events(organization_id,actor_id,action,notes)
    values(v_org_id,p_reviewed_by,'rejected',p_reason);
  end if;
  return r;
end;
$$;
