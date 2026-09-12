alter table public.organizations drop constraint if exists organizations_category_check;

alter table public.organizations add constraint organizations_category_check check (
  category = any (array[
    'agriculture'::text,
    'énergie'::text,
    'déchets'::text,
    'eau'::text,
    'mobilité'::text,
    'notoriété'::text,
    'artiste'::text,
    'auteur'::text,
    'entrepreneur'::text,
    'expert'::text,
    'formateur'::text,
    'créateur de contenu'::text,
    'personnalité publique'::text,
    'autre profil humain'::text,
    'autre'::text
  ])
);
