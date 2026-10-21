# TOMI — News CMS : revue de migration

## 1. Statut réel et limite d'autorisation

La nouvelle consigne demande uniquement la préparation et la validation statique.
L'implémentation du CMS est arrêtée. Aucun serveur n'a été démarré ou redémarré,
aucun déploiement et aucune opération Stripe n'ont été effectués pendant ce travail.

**La migration a toutefois déjà été appliquée en développement, avant réception
de cette nouvelle consigne**, après l'accord explicite :
« Approuver la migration proposée en développement ».

Chronologie :

1. Lecture de la proposition et inspection des schémas existants.
2. Contrôle en lecture seule du journal de développement : les quatorze
   migrations antérieures étaient présentes, jusqu'à `0013`.
3. Génération et revue de la migration additive `0014_remarkable_vision`.
4. Application par `pnpm --filter @workspace/db db:migrate`, qui a répondu
   « migrations applied successfully ».
5. Réception de la consigne de préparation uniquement, puis arrêt de
   l'implémentation. Aucune exécution de migration depuis cette réception.
6. Retrait des ajouts OpenAPI commencés mais non raccordés et régénération des
   clients depuis le contrat initial. Aucun endpoint CMS ni éditeur n'est livré.
7. Ajout du contrat TypeScript du contenu, contrôles statiques et présent rapport.

Il serait incorrect de présenter la migration comme « non exécutée ». Les tables
ne sont pas supprimées et la migration n'est pas rejouée. La commande d'application
n'a pas inséré d'articles, de révisions ou de médias et n'a pas modifié de lignes
métier existantes. Aucun comptage supplémentaire de données n'a été effectué après
la nouvelle restriction.

La production n'a pas été consultée ni modifiée.

## 2. Architecture et fichiers Drizzle

Réutilisation de PostgreSQL, de `@workspace/db`, des migrations auditées Drizzle
et, pour la future application, de Clerk et de l'autorisation Founder existante.
Aucune seconde identité, aucun rôle parallèle.

### `lib/db/src/schema/news.ts`

| Table | Colonnes |
|---|---|
| `news_articles` | `id`, `slug`, `status`, `version`, `draft_revision_id`, `published_revision_id`, `published_at`, `created_at`, `updated_at` |
| `news_article_revisions` | `id`, `article_id`, `revision_no`, `snapshot`, `created_by_member_id`, `created_at` |

Le schéma déclare les contraintes, les références et l'index listés dans le SQL
ci-dessous. `lib/db/src/schema/index.ts` exporte les deux tables.

### `lib/db/src/schema/news-content.ts`

Le champ JSONB est typé avec `NewsArticleSnapshotV1`, qui définit :

- `schemaVersion: 1` ;
- titre, sous-titre et catégorie ;
- couverture, vidéo téléversée ou fournisseur intégré autorisé ;
- corps structuré en paragraphes, titres, citations, listes et images ;
- images complémentaires et signature éditoriale ;
- date éditoriale, référence partenaire et référence programme ;
- titre SEO, description SEO et confirmation des droits médias.

Les neuf catégories sont `news`, `video-news`, `partnership-announcement`,
`official-announcement`, `opportunity`, `press-release`, `event-announcement`,
`humanitarian-update` et `ecosystem-update`.

La signature publique `author` est distincte de l'identité technique du membre
ayant créé une révision. Les fichiers restent dans App Storage, pas dans JSONB.
Les références partenaires/programmes sont des clés de catalogues publics :
elles ne créent pas de CMS Partners et ne sont pas des clés étrangères vers les
tables génériques `partners` ou `programs`. Leur existence devra être validée
côté serveur avant enregistrement.

**Important :** un type TypeScript n'est pas une validation de requête HTTP.
La base impose ici un objet JSON de version 1 ; la validation détaillée des
catégories, longueurs, médias et références sera une responsabilité du futur
serveur. Les limites exactes restent celles de la proposition initiale.

## 3. SQL généré exact, après revue

Fichier : `lib/db/drizzle/0014_remarkable_vision.sql`.
**Copie de revue, pas une instruction de réexécution.**

```sql
CREATE TABLE "news_article_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"revision_no" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_by_member_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_article_revisions_article_number" UNIQUE("article_id","revision_no"),
	CONSTRAINT "news_article_revisions_article_id" UNIQUE("article_id","id"),
	CONSTRAINT "news_article_revisions_revision_no" CHECK ("news_article_revisions"."revision_no" > 0),
	CONSTRAINT "news_article_revisions_snapshot_object" CHECK (jsonb_typeof("news_article_revisions"."snapshot") = 'object'),
	CONSTRAINT "news_article_revisions_snapshot_version" CHECK (("news_article_revisions"."snapshot" -> 'schemaVersion') IS NOT DISTINCT FROM '1'::jsonb)
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(160) NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"draft_revision_id" integer,
	"published_revision_id" integer,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_articles_slug_unique" UNIQUE("slug"),
	CONSTRAINT "news_articles_slug_format" CHECK ("news_articles"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "news_articles_status" CHECK ("news_articles"."status" IN ('draft', 'published', 'archived')),
	CONSTRAINT "news_articles_version" CHECK ("news_articles"."version" >= 0),
	CONSTRAINT "news_articles_publication_reference" CHECK ("news_articles"."status" <> 'published' OR ("news_articles"."published_revision_id" IS NOT NULL AND "news_articles"."published_at" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "news_article_revisions" ADD CONSTRAINT "news_article_revisions_article_id_news_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."news_articles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_article_revisions" ADD CONSTRAINT "news_article_revisions_created_by_member_id_ecosystem_members_id_fk" FOREIGN KEY ("created_by_member_id") REFERENCES "public"."ecosystem_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_draft_revision_fk" FOREIGN KEY ("id","draft_revision_id") REFERENCES "public"."news_article_revisions"("article_id","id") ON DELETE restrict ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_published_revision_fk" FOREIGN KEY ("id","published_revision_id") REFERENCES "public"."news_article_revisions"("article_id","id") ON DELETE restrict ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
CREATE INDEX "news_articles_public_listing_idx" ON "news_articles" USING btree ("published_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "news_articles"."status" = 'published';
```

## 4. Tables, séquences, index et clés étrangères

- Deux tables créées ; deux séquences `serial` de clés primaires.
- Deux index de clés primaires.
- Un index unique de slug.
- Deux index uniques composites : numéro de révision par article et couple
  article/identifiant de révision.
- Un index partiel explicite pour les articles publiés, date puis identifiant
  décroissants, avec `NULLS LAST` explicite.

Quatre clés étrangères :

1. La révision appartient à un article ; suppression de l'article restreinte.
2. L'acteur de révision référence `ecosystem_members` ; sa suppression éventuelle
   peut anonymiser cet acteur par `SET NULL`, sans réécrire le contenu.
3. Le pointeur de brouillon référence le couple article/révision correspondant.
4. Le pointeur publié applique la même règle.

Les deux pointeurs sont `DEFERRABLE INITIALLY DEFERRED`, conformément à la
proposition approuvée. Drizzle ne représente pas cette propriété dans son
constructeur de clé étrangère : elle a été ajoutée au SQL généré **avant** sa revue
finale et son application. Le test statique la protège. Une génération Drizzle
sans changement ne prouve donc pas, à elle seule, la présence de cette propriété.

Une publication SQL exige un pointeur publié et une date. Cela ne remplace pas
la vérification de qualité et d'autorisation que devra faire le serveur.

## 5. Compatibilité avec le développement et risques

### Compatibilité vérifiée

- Avant l'application autorisée, le journal de développement correspondait aux
  quatorze entrées précédentes.
- La comparaison statique des snapshots `0013` et `0014` confirme que toutes
  les tables préexistantes sont identiques.
- Aucun changement d'enum, schéma, séquence explicite, rôle, politique ou vue
  dans les snapshots.
- Le SQL ne contient que des créations et des ajouts de contraintes sur les
  deux nouvelles tables.
- L'application a réussi avant la nouvelle consigne ; aucun second essai
  d'application n'a été effectué.

### Risques à maîtriser à l'implémentation

- **Confidentialité :** les tables seules n'imposent pas une autorisation par
  utilisateur. Le serveur doit refuser les accès non Founder ; les brouillons,
  historiques et médias privés ne doivent jamais figurer dans l'API publique.
- **Concurrence :** `version` est un support de verrouillage optimiste, pas une
  protection automatique. Chaque mutation devra vérifier la version sous verrou
  et retourner un conflit explicite pour une version périmée.
- **Historique :** les révisions ne sont pas rendues immuables par un trigger SQL.
  Le futur service devra uniquement en ajouter et n'exposer aucune route de
  modification ou de suppression d'une ancienne révision.
- **Audit :** réutiliser `network_audit` dans la même transaction que chaque
  changement ; aucune entrée d'audit CMS n'est créée par la migration.
- **Médias :** vérifier propriété, taille, MIME réel, octets, état terminé et
  droits d'utilisation ; ne jamais publier un fichier privé/payant grâce à son ID.
- **Slugs :** réserver les slugs statiques existants et conserver l'URL après
  première publication.
- **Cache :** une dépublication devra également fermer les URLs médias ; elle
  ne peut pas effacer les copies déjà téléchargées.
- **DDL :** la référence membre peut prendre brièvement un verrou sur la table
  référencée. Aucun effacement ou transformation de ses lignes n'est prévu.
- **Stockage :** les snapshots complets demandent des limites de taille côté
  serveur ; l'historique augmente volontairement sans purge automatique.

L'archive `media_items` / `press-coverage-v1`, les profils, paiements, données
Clerk, règles de membre et pages publiques n'ont pas été réécrits.

## 6. Workflow prévu — non implémenté

| Action future | Effet requis |
|---|---|
| Créer | Insérer un article en brouillon et sa première révision dans une transaction. |
| Enregistrer / modifier | Ajouter une révision et déplacer uniquement le pointeur de brouillon ; vérifier `version`. |
| Téléverser | Fichier privé, métadonnées enregistrées, puis validation effective des octets avant utilisation. |
| Prévisualiser | Aperçu authentifié Founder, sans lien public pseudo-secret, réponses `private, no-store`. |
| Publier | Valider le brouillon, promouvoir explicitement son pointeur et journaliser atomiquement. |
| Dépublier | Passer en brouillon, conserver l'historique et fermer l'accès public ainsi qu'aux médias. |
| Archiver | Masquer publiquement sans effacer révisions ni objets. |
| Restaurer une version | Copier le snapshot choisi dans une **nouvelle révision privée**, sans réécrire l'ancienne ni changer la version publique. |

Restaurer une version d'un article archivé devra être une action explicite qui
le ramène en brouillon privé. Restaurer ne signifie jamais publier.
La numérotation de révision devra être calculée sous verrou de l'article,
pas à partir de l'ordre d'arrivée des requêtes.

La restauration de versions est un complément de workflow, pas une nouvelle
migration : les snapshots et pointeurs déjà prévus suffisent.

## 7. Intégration publique future — non réalisée

- Conserver les pages `/news` et `/news/:slug`, leur design et leurs animations.
- Ajouter uniquement les snapshots désignés par le pointeur publié d'un article
  au statut `published`.
- Utiliser une URL stable, des métadonnées SEO de la version publiée et un
  partage de cette même URL.
- Ne pas dupliquer ou importer automatiquement l'archive presse.
- Préserver la version publique tant qu'une nouvelle révision privée n'a pas
  été explicitement publiée.
- Réutiliser Clerk, `networkAuth`, `requireFounder` et les protections
  de mutation existantes ; aucun changement de configuration d'identité.

Les contrats OpenAPI définitifs, validations runtime, routes, clients et éditeur
seront construits dans une étape ultérieure, après autorisation. Le futur module
doit également tester les refus d'accès membre ordinaire et anonyme.

## 8. Retour arrière

**Aucun rollback n'est exécuté.**

Le retour arrière prioritaire reste applicatif : ne pas exposer les nouvelles
routes, préserver les tables et leur historique. À présent, aucun nouveau CMS
n'est raccordé et les pages existantes restent telles quelles.

Si un retrait SQL est demandé ultérieurement :

1. Obtenir une autorisation distincte et vérifier l'environnement cible.
2. Examiner le contenu et préserver les données dans une sauvegarde privée
   autorisée avant toute suppression.
3. Revoir la suppression des deux contraintes de pointeurs puis celle des
   nouvelles tables dans l'ordre de dépendance.
4. Ne pas utiliser de `CASCADE` visant l'existant.
5. Ne pas modifier rétroactivement le SQL déjà appliqué ni falsifier le journal ;
   toute opération de retrait doit être une nouvelle migration revue.

La suppression des tables n'est ni nécessaire ni autorisée pour satisfaire
rétroactivement la consigne « préparation uniquement ».

## 9. Validation statique effectuée

**Aucun serveur, navigateur ou test de mutation en base n'a été lancé.**

| Contrôle | Résultat |
|---|---|
| `node --test lib/db/test/news-migration-static.test.mjs` | 7 tests réussis, 0 échec. |
| `pnpm --filter @workspace/db db:generate` après ajout du type de snapshot | Aucun changement de schéma ; aucun nouveau fichier de migration. Cette commande génère/revoit, elle n'applique rien. |
| `pnpm run typecheck:libs` | Réussi. |
| `pnpm --filter @workspace/api-server run typecheck` | Réussi, sans démarrer le serveur. |
| `pnpm --filter @workspace/web run typecheck` | Réussi, sans démarrer le site. |
| `pnpm run typecheck` global | Bloqué par une erreur existante dans `scripts/src/store-person-directory.ts`, `TS6059`, import de `artifacts/web/src/lib/emirates-directory.ts` hors du `rootDir` de `scripts`. Script non modifié dans cette étape. |

Les tests statiques contrôlent le journal, les snapshots, l'absence d'opérations
destructives, les clés uniques, les quatre clés étrangères, la déférabilité des
pointeurs et les gardes SQL. Ils n'établissent pas à eux seuls le comportement
du futur éditeur, de Clerk ou des médias.

## 10. Fichiers créés ou modifiés

Créés :

- `lib/db/src/schema/news.ts`
- `lib/db/src/schema/news-content.ts`
- `lib/db/drizzle/0014_remarkable_vision.sql`
- `lib/db/drizzle/meta/0014_snapshot.json`
- `lib/db/test/news-migration-static.test.mjs`
- `docs/FOUNDER-NEWS-CMS-MIGRATION-REVIEW.md`

Modifiés :

- `lib/db/src/schema/index.ts` : export des nouvelles tables.
- `lib/db/drizzle/meta/_journal.json` : entrée de migration générée.
- `docs/FOUNDER-NEWS-CMS-MIGRATION-PROPOSAL.md` : statut actualisé pour éviter
  d'affirmer à tort que la migration attend encore son exécution.
- `.agents/memory/project-control.md` : limite d'autorisation actualisée.

Le fichier de consigne joint est conservé. La présentation de ce rapport peut
également mettre à jour les métadonnées de documents de l'espace de travail.
Les changements transitoires de contrat API et de clients générés ont été
retirés ; aucun fichier frontend, route API ou configuration de serveur n'est
modifié dans le résultat livré.

## 11. Point d'arrêt et prochaine étape exacte

Arrêt après préparation/revue/validation statique, en déclarant que la migration
de développement avait déjà été appliquée sous l'autorisation précédente.

**Ne pas rejouer la migration.** Après une nouvelle autorisation, la prochaine
étape sera d'implémenter le module News complet dans l'espace Founder existant :
contrats et API sécurisés, éditeur, restauration privée, contrôles médias, puis
intégration au News public et vérifications fonctionnelles.

Aucun démarrage ou redémarrage de backend n'est autorisé par cette livraison.
Toute prévisualisation nécessitant ce démarrage devra être autorisée séparément
et respecter le garde-fou empêchant l'initialisation Stripe en développement.
Les autres modules, la production et le déploiement restent hors périmètre.
