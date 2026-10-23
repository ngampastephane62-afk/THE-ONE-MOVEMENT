# Secteurs actifs et confidentialité — migration appliquée en développement

Après l'autorisation distincte d'application, la migration canonique
`0017_active_sector_privacy` a été appliquée uniquement en développement.
La cible a été comparée à celle du service de base de développement et les
17 migrations précédentes ont été vérifiées par leurs empreintes SQL.
Ce dossier conserve la proposition historique ; ne jamais rejouer son SQL
manuellement ni importer son schéma dans l'application.

## Trois colonnes proposées

- `active_sectors text[]`, nullable, sans valeur par défaut. NULL signifie que le
  membre n'a pas encore confirmé ses appartenances actives. Lorsqu'il le fait :
  un à trois secteurs canoniques distincts, sans NULL ni tableau imbriqué.
  `main_sector`, déjà présent, doit alors être renseigné et appartenir à ce choix.
  L'ordre des secteurs ne remplace pas la sélection explicite du principal.
- `location_visibility text NOT NULL DEFAULT 'hidden'`, limité à `hidden`,
  `country`, `country_city`. Les profils existants ont reçu `hidden` ;
  aucune donnée de localisation existante n'est effacée.
- `other_professional_activity varchar(300)`, nullable, privé, sans création de
  secteur officiel.

Les intérêts existants (`sectors`) restent intacts. Aucun backfill d'appartenance,
aucune troncature des choix, suppression, nouvelle table, modification d'identité,
permission, abonnement, paiement ou restriction rétroactive d'accès.

## Génération et revue

Base de génération : journal canonique arrêté à `0016_member_profile_extension`.
Copier son contenu dans `/tmp/tomi-active-sector-privacy-review`, puis depuis
`lib/db` utiliser :

`pnpm exec drizzle-kit generate --config ./review/active-sector-privacy/drizzle.review.config.ts --name active_sector_privacy_review`

La configuration ne contient aucune connexion et ne fait que générer un diff.
Le SQL conservé ici est identique au résultat généré (hors saut de ligne final).
Il comporte trois ADD COLUMN et deux ADD CONSTRAINT, sans DML ni DROP.
Ne pas copier ce fichier dans `drizzle/` avant autorisation distincte et
vérification du prochain numéro de migration (d'autres travaux peuvent avancer).

## Procédure suivie pour cette application

Autorisation d'application en développement obtenue. Cible et historique réel
vérifiés, SQL canonique généré puis comparé au SQL approuvé et appliqué avec
`db:migrate`, délai de verrouillage de 5 secondes et délai d'exécution de
30 secondes. Aucun déploiement, aucune écriture en production.

Contrôles après application : 27 profils conservés ; empreinte agrégée de tous
les anciens champs identique avant/après ; les 27 nouvelles préférences sont
`active_sectors = NULL`, `location_visibility = hidden` et
`other_professional_activity = NULL`. Les deux contraintes sont validées,
le journal contient 18 migrations et la génération depuis le schéma réel
ne produit aucun diff. L'API redémarrée renvoie un annuaire public valide,
sans propagation des nouveaux champs privés.

L'application de ces champs ne rendra pas le parcours membre fonctionnel à elle
seule. La validation API, les formulaires préremplis, l'édition, les projections
publiques et imbriquées, les filtres et les caches doivent être implémentés et
vérifiés avant d'annoncer le consentement de localisation ou la règle trois secteurs
comme opérationnels. Conserver les valeurs privées pour le propriétaire.
Ne pas ajouter ces champs aux contrats publics par simple propagation du schéma.
