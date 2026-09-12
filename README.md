# Bickri Verified — Badge Vert Africain

Plateforme de reconnaissance et d’annuaire des organisations, entrepreneurs et projets africains dont l’impact peut être documenté et vérifié.

## Architecture

- `index.html` — landing page, annuaire, méthodologie et formulaire de candidature.
- `styles.css` — identité visuelle responsive.
- `app.js` — connexion Supabase, lecture des organisations approuvées, recherche/filtre et dépôt des candidatures.
- `vercel.json` — configuration de déploiement statique et en-têtes de sécurité.
- `supabase/migrations/20260912100000_create_badge_vert.sql` — modèle PostgreSQL et RLS.

## Modules fonctionnels

1. **Annuaire public** : seules les organisations `approved` sont visibles.
2. **Recherche et filtres** : nom, ville/pays et catégorie.
3. **Candidature** : insertion publique contrôlée dans `badge_applications`.
4. **Critères** : réduction de l’impact, économie circulaire, impact collectif.
5. **Évaluation** : `organization_criteria` conserve les scores et preuves.
6. **Cycle de badge** : `pending` → `approved` → `suspended`, avec dates d’émission et d’expiration.

## Supabase connecté

Projet utilisé : `okdohokhlkxrmxpevees` (`Bickri service agency`). Le schéma Verified est isolé dans quatre tables dédiées et protégé par Row Level Security. La clé publishable utilisée par le navigateur n’est pas une clé `service_role`.

## Déploiement Vercel

Le projet est volontairement sans build : Vercel peut servir directement `index.html`. Le dépôt GitHub canonique est :

`https://github.com/mabdourahamane886-lang/bickri-verified`

## Évolution recommandée

La prochaine couche doit être un espace administrateur authentifié pour examiner les candidatures, créer/modifier les organisations, attribuer les scores et publier ou suspendre les badges. Les opérations d’administration ne doivent jamais utiliser une clé privilégiée dans le navigateur.
