# Thanks the World — revue de la migration préparée

## Décision et périmètre

Le Fondateur a autorisé la préparation du schéma et du SQL, **sans application**.
Cette étape est terminée. La campagne n’est pas encore fonctionnelle.
Aucune commande de migration, de push, de seed ou de démarrage de service
n’a été exécutée.

## Fichier examiné

- SQL : `lib/db/drizzle/0015_absurd_wallow.sql`
- Schéma : `lib/db/src/schema/gratitude.ts`, exporté par le barrel existant.
- Métadonnées locales : `0015_snapshot.json` et nouvelle entrée du journal.
- SHA-256 du SQL :
  `d356316c51acc972c143e60243149cb57e8b6abfd0da339d287a5f38f7f3c923`

Ces métadonnées décrivent une migration disponible dans le dépôt, pas une
migration exécutée dans PostgreSQL.

## Résultat de la revue

39 instructions :

- 7 `CREATE TABLE`, exclusivement les sept tables approuvées ;
- 20 clés étrangères ajoutées exclusivement sur ces nouvelles tables ;
- 12 index, dont les deux index uniques partiels de signalement.

Les tables incluent 33 CHECK et les contraintes de clé primaire/unicité prévues.
Les 43 définitions de tables préexistantes sont identiques dans les snapshots
avant/après. Pas de nouveau type enum.

**Aucun DROP, TRUNCATE, RENAME, INSERT, UPDATE de données ou DELETE de données.**
Aucun ALTER sur une table préexistante.
Les clauses `ON DELETE CASCADE/RESTRICT/SET NULL` définissent le comportement
futur des références ; elles ne suppriment aucune donnée lors de cette migration.
Pas de campagne activée ni de contenu créé par ce fichier.

## Conformité au schéma approuvé

- Six états de contribution ; valeur initiale `draft`.
- Pays facultatif au brouillon, code à deux lettres ; huit thèmes autorisés.
- Publication conditionnée par une version approuvée explicitement non NULL,
  consentement, droits confirmés, revue, titre, pays et thème.
- Mise en avant réservée à une contribution à l’état `published`.
- Vidéo à l’état `ready` conditionnée par une durée validée de 1 à 180000 ms
  et une référence de lecture.
- Références aux uploads existants avec suppression restreinte.
- Interactions dédupliquées par contribution/membre/type.
- Signalements ouverts dédupliqués par cible/membre.
- Fenêtres anti-spam partageables entre instances par clé primaire composée.
- Journalisation future via `network_audit`, sans nouvelle table d’audit.

Pas d’élargissement du schéma approuvé. `btrim` précise le contrôle de contenu
vide des titres/commentaires/motifs ; les noms techniques de contraintes et
index sont maintenant explicites.

## Vérifications effectuées, sans connexion à une base

1. `pnpm --filter @workspace/db run db:generate` : réussite.
   Génération à partir du schéma et du snapshot local ; aucune application SQL.
2. `pnpm exec tsc -p lib/db/tsconfig.json --noEmit` : réussite.
3. `node --test lib/db/test/gratitude-migration.test.mjs` : **6 tests réussis**.
   Ils couvrent le périmètre additif, les tables préexistantes, le journal,
   la publication avec NULL, les contrôles vidéo et les index/déduplications.
4. Lecture du SQL généré et inventaire des instructions : conformes.

Ce ne sont pas des tests d’exécution PostgreSQL. La validité à l’exécution,
les interactions concurrentes et l’intégration applicative seront vérifiées
après autorisation sur un environnement de développement confirmé.
Aucune requête de statut de migration n’a été faite sur une base réelle ;
on ne prétend donc pas connaître son état de migration actuel.

## Ce que cette migration ne sécurise pas à elle seule

Les CHECK ne remplacent pas les services à construire : autorisation Founder,
interdiction d’auto-approbation, propriété des médias, contrôle de version,
confidentialité, consentement versionné, pays valides, campagnes actives,
validation des fichiers et durées réelles, traitement sûr, quotas atomiques,
anti-spam et comptes à exclure du classement.

En particulier, rien ne doit exposer les fichiers de campagne via les routes
génériques du réseau ou de News. Les nouveaux uploads ne seront pas ouverts
avant ces protections. Les références entre signalement/commentaire et les
liens entre contribution/propriétaire d’un upload doivent être vérifiés dans
le service transactionnel, comme prévu dans la proposition.

Attention pour la future suppression de commentaires : `ON DELETE SET NULL`
peut déplacer un signalement vers l’index des signalements d’histoire. Le service
devra gérer la collision éventuelle avec un signalement ouvert existant avant
une suppression physique ; ne pas laisser remonter une erreur d’unicité au membre.

La création d’une table n’active ni le formulaire, ni les vidéos, ni le feed,
ni le classement, ni les actions du Founder. Les pages publiques, Clerk, Stripe,
les abonnements et les permissions existantes restent inchangés.

## Étape suivante soumise à une autorisation distincte

1. Autoriser explicitement l’application en développement uniquement.
2. Vérifier l’environnement et lire le registre des migrations de cette base,
   sans afficher ses identifiants de connexion.
3. Vérifier les migrations effectivement en attente : un migrate peut appliquer
   toutes les migrations manquantes, pas uniquement le dernier fichier.
   S’arrêter si une migration supplémentaire non autorisée est en attente.
4. Confirmer que le SQL et son empreinte correspondent à cette revue, puis
   appliquer avec l’outil de migration du projet, jamais un push.
5. Contrôler les tables/contraintes et le registre après application.

Tout changement de SQL après cette revue exige une nouvelle revue.
Ne pas démarrer l’implémentation complète ni publier implicitement à partir
du seul accord de préparation.

## Retour arrière

Avant application : les fichiers préparés n’ont aucun effet sur la base.
Après une éventuelle application autorisée : désactiver les points d’entrée
campagne, conserver les nouvelles tables, les objets privés et l’audit.
Pas de DROP automatique ; toute suppression définitive exige un accord séparé.
