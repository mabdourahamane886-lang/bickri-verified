alter table public.organizations drop constraint if exists organizations_category_check;
alter table public.organizations add constraint organizations_category_check check (category = any (array['agriculture','énergie','eau','mobilité','notoriété','artiste','auteur','entrepreneur','expert','formateur','créateur de contenu','personnalité publique','autre profil humain','autre']));
update public.organizations set category = 'autre' where category = 'déchets';
update public.badge_applications set applicant_category = 'autre' where applicant_category = 'déchets';
