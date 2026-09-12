# Bickri Verified — Badge Vert Africain

Plateforme panafricaine de reconnaissance et d’annuaire des organisations, entrepreneurs et projets africains dont l’impact et la fiabilité peuvent être documentés et vérifiés.

## Nouvelle interface

La version actuelle met en avant :

- une identité visuelle centrée sur le Badge Vert Africain ;
- une illustration de deux adultes africains en harmonie, avec une femme tenant un téléphone ;
- une présentation détaillée de la valeur du badge et de son processus de vérification ;
- un annuaire avec recherche, catégories et filtre par pays ;
- les **54 pays d’Afrique** dans le sélecteur et le parcours de candidature ;
- la présentation de **Mohamed Bickri Jr., Fondateur & CEO** ;
- une candidature connectée à Supabase.

## Architecture

- `app/page.tsx` — landing page, annuaire, couverture panafricaine, profil CEO et formulaire.
- `app/globals.css` — identité visuelle responsive et composants de l’interface.
- `lib/supabase.ts` — client Supabase.
- `assets/badges/` et `public/badges/` — Badge Vert Africain.
- `supabase/migrations/20260912100000_create_badge_vert.sql` — schéma initial.
- `supabase/migrations/20260912174200_add_africa_countries_and_application_country.sql` — 54 pays + pays de candidature.

## Supabase

Projet connecté : `okdohokhlkxrmxpevees` (`Bickri service agency`). La table `africa_countries` contient 54 entrées et est lisible publiquement via RLS. Le formulaire stocke maintenant le pays du candidat dans `badge_applications.applicant_country`.

Les clés privilégiées ne doivent jamais être exposées dans le navigateur.

## Déploiement

Dépôt GitHub canonique :

`https://github.com/mabdourahamane886-lang/bickri-verified`

Le projet utilise Next.js et peut être déployé sur Vercel avec les variables d’environnement Supabase appropriées.
