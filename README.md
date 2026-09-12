# Badge Vert

Badge Vert est une vitrine et un annuaire des organisations africaines dont l’engagement environnemental est documenté et vérifiable. Cette première version fournit une landing page responsive, un annuaire filtrable et le schéma Supabase de production.

## Structure

- `index.html` : structure sémantique de la page et sections publiques.
- `styles.css` : direction visuelle, responsive design et états de focus natifs.
- `app.js` : données de démonstration et recherche/filtre côté navigateur.
- `supabase/migrations/20260912100000_create_badge_vert.sql` : tables, types, index, RLS, politiques publiques et critères initiaux.

## Lancer localement

Le projet ne nécessite aucune dépendance pour la démonstration statique :

```bash
python3 -m http.server 4173
```

Puis ouvrir `http://localhost:4173`.

## Modèle de données

Le modèle sépare les organisations, les candidatures, les critères d’évaluation et les scores documentés. Les organisations ne deviennent visibles publiquement qu’avec le statut `approved`. Les candidatures sont insérables publiquement, mais leur lecture et leur traitement doivent être réalisés par un rôle administrateur côté Supabase.

## Supabase

Aucun projet Supabase n’était accessible dans la session au moment de la livraison (`list_projects` a retourné une liste vide). La migration est donc versionnée dans GitHub mais n’a pas pu être appliquée à distance. Dès qu’un projet est connecté, appliquer la migration avec Supabase CLI :

```bash
supabase db push
```

Ne jamais placer de clé `service_role` dans le navigateur. Pour brancher l’annuaire réel, remplacer le tableau de démonstration de `app.js` par un module Supabase utilisant uniquement la clé publique et les politiques RLS ci-dessus.

## Vérification

La structure a été contrôlée par validation HTML de base, analyse syntaxique JavaScript et lancement du serveur statique local.
