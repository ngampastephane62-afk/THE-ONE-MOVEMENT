# Thanks the World — revue de la migration préparée

## Décision et périmètre

Le Fondateur a autorisé la préparation du schéma et du SQL, **sans application**.
La préparation a été terminée, puis le Fondateur a donné un accord distinct
pour les contrôles et l’application en développement uniquement.
La migration est désormais appliquée en développement. La campagne n’est pas
encore fonctionnelle. Aucun push, seed ou démarrage de service n’a été exécuté.

## Application autorisée et vérifiée

- La cible du runner a été comparée à la base explicitement sélectionnée avec
  `executeSql(environment: development)` : même base et identifiant de cluster.
  Aucun identifiant de connexion ou secret n’a été affiché.
- Les marqueurs de l’éditeur étaient présents et le marqueur de déploiement
  publié n’était pas actif ; `REPLIT_ENVIRONMENT` n’a pas servi à classer la cible.
- Les quinze migrations historiques correspondent toutes au journal local :
  mêmes horodatages et empreintes SHA-256 des fichiers.
- Seule la migration revue était en attente ; aucune table de campagne existante
  n’entrait en collision avec les créations.
- L’empreinte du SQL a été vérifiée avant exécution, puis le script existant
  `pnpm run db:migrate` a terminé avec succès dans `lib/db`.
- La lecture du registre en développement confirme la nouvelle entrée et
  l’empreinte exacte du SQL revu.
- Le catalogue PostgreSQL confirme sept tables, 74 colonnes, sept clés primaires,
  vingt clés étrangères, trente-trois CHECK et cinq contraintes d’unicité ;
  toutes les contraintes sont validées.
- Vingt-quatre index existent, en comptant ceux des clés primaires et des
  contraintes d’unicité, dont les douze index explicitement créés.
- Les sept nouvelles tables contiennent chacune zéro ligne.

La production n’a pas été consultée ou modifiée. Aucun redémarrage d’API,
aucun changement d’interface et aucun déploiement. Aucun test d’upload,
d’autorisation ou de publication n’est revendiqué : leurs services ne sont pas
encore implémentés.

Les sections suivantes conservent la revue préalable, y compris son état
historique « non appliqué » au moment de sa rédaction.

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

## Procédure d’application — réalisée après autorisation distincte

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
L’accord de migration ne vaut pas déploiement. Prochaine étape proposée :
implémenter les services et interfaces du module selon les protections approuvées,
sans rejouer la migration ni créer de contenu factice.

## Retour arrière

Avant application : les fichiers préparés n’ont aucun effet sur la base.
Après une éventuelle application autorisée : désactiver les points d’entrée
campagne, conserver les nouvelles tables, les objets privés et l’audit.
Pas de DROP automatique ; toute suppression définitive exige un accord séparé.
