# Secteurs actifs et confidentialité — SQL préparé, NON APPLIQUÉ

Autorisation reçue : schéma et génération SQL uniquement. Aucun changement à la
base, au schéma importé par le serveur ou au journal canonique des migrations.
Ce dossier ne doit jamais être importé par l'application.

## Trois colonnes proposées

- `active_sectors text[]`, nullable, sans valeur par défaut. NULL signifie que le
  membre n'a pas encore confirmé ses appartenances actives. Lorsqu'il le fait :
  un à trois secteurs canoniques distincts, sans NULL ni tableau imbriqué.
  `main_sector`, déjà présent, doit alors être renseigné et appartenir à ce choix.
  L'ordre des secteurs ne remplace pas la sélection explicite du principal.
- `location_visibility text NOT NULL DEFAULT 'hidden'`, limité à `hidden`,
  `country`, `country_city`. Les profils existants recevront `hidden` si la
  migration est approuvée ; aucune donnée de localisation existante n'est effacée.
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

## Avant une application ultérieure

Demander l'autorisation d'application en développement. Vérifier la cible et
l'historique réel, régénérer depuis l'état canonique actuel, comparer le SQL puis
appliquer par le workflow normal generate → review → migrate.
Prévoir des délais de verrouillage et d'exécution bornés : ALTER TABLE prend des
verrous et les contraintes sont validées sur les lignes existantes.

L'application de ces champs ne rendra pas le parcours membre fonctionnel à elle
seule. La validation API, les formulaires préremplis, l'édition, les projections
publiques et imbriquées, les filtres et les caches doivent être implémentés et
vérifiés avant d'annoncer le consentement de localisation ou la règle trois secteurs
comme opérationnels. Conserver les valeurs privées pour le propriétaire.
Ne pas ajouter ces champs aux contrats publics par simple propagation du schéma.
