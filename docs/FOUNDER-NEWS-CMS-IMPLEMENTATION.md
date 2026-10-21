# TOMI — News & Publishing : implémentation en développement

## Statut

Le code du module News est implémenté. Après autorisation distincte du Founder,
l'API de développement a été redémarrée en mode protégé. Ses journaux confirment :
`automatic Stripe initialization disabled explicitly; no payment bootstrap or retry scheduled`.

**Les 12 contrôles HTTP publics/anonymes réussissent. Le parcours privé Founder
reste non vérifié**, faute de session authentifiée légitime disponible dans
l'outil de contrôle. Aucune session n'a été fabriquée, identité modifiée ou
autorisation contournée pour les tests.

La nouvelle liste publique répond 200 avec zéro article publié : aucun article
de démonstration n'a été ajouté. Le contrôle visuel de `/news` confirme
l'affichage de la page et de ses annonces existantes, sans les précédentes
erreurs 404 des appels CMS. Cette capture ne valide pas l'éditeur privé.

Aucune migration n'a été rejouée, aucun déploiement effectué et aucune opération
Stripe déclenchée par ce redémarrage de développement.

## 1. Architecture réutilisée

- Workspace et shell membre existants, route `/member/founder/news`.
- Clerk, `networkAuth`, `requireFounder`, `networkWrite` et acteur dérivé du serveur.
- Tables News précédemment approuvées, PostgreSQL et Drizzle.
- Registre `network_uploads`, validation réelle des fichiers et App Storage privé.
- Journal `network_audit`, écrit dans la transaction de chaque mutation News.
- Page publique News, archive presse, articles statiques, annonces vidéo et
  animations existants.
- Contrat OpenAPI et génération des clients React Query / schémas Zod.

Aucune configuration Clerk, règle d'appartenance, identité Founder, intégration
de paiement ou donnée de production n'est modifiée.

## 2. Capacités implémentées dans le code

- Les neuf catégories approuvées.
- Création et sauvegarde de brouillons privés.
- Titre, sous-titre, couverture, vidéo téléversée ou référence YouTube/Vimeo,
  corps structuré, images complémentaires, auteur, date, partenaire/programme et SEO.
- Blocs texte, titres, citations, listes et images : ajout, édition, ordre et retrait.
- Aperçu privé utilisant le même rendu structuré que le public.
- Publication explicite d'une version sauvegardée, dépublication et archivage.
- Historique paginé, inspection et restauration en **nouvelle révision privée**.
- Réouverture d'un article archivé par restauration privée ; publication séparée.
- Protection du travail non sauvegardé, blocage des changements pendant une
  requête/téléversement, récupération explicite de la version serveur après conflit.
- Mise à jour du cache détail depuis la réponse de mutation, puis invalidation
  des listes/détails Founder et publics.

Ces capacités sont codées et testées hors ligne pour les règles métier ; leur
fonctionnement complet dans un navigateur authentifié reste à vérifier.

## 3. Contrats et intégration publique

Routes :

- `GET /api/news/articles?page=…`
- `GET /api/news/articles/:slug`
- `GET /api/news/articles/:slug/media/:uploadId`
- `GET /api/founder/news?page=…`
- `GET /api/founder/news/options`
- `GET /api/founder/news/:id?historyPage=…`
- `POST /api/founder/news/actions`
- `POST /api/founder/news/uploads`
- `POST /api/founder/news/uploads/:uploadId/complete`
- `GET /api/founder/news/media/:uploadId`

L'action privée couvre `create`, `save`, `publish`, `unpublish`, `archive` et
`restore`. Les champs de requête sont validés ; l'identité ne vient jamais du corps.

La liste publique existante reçoit une section CMS distincte. L'archive presse
n'est ni importée, ni dupliquée, ni remplacée. Les anciens articles statiques et
la route spéciale Pink October restent prioritaires. Les nouveaux articles
utilisent `/news/:slug`, des métadonnées SEO et le partage natif ou une copie du lien.

Les requêtes publiques ne sélectionnent que la révision publiée des articles
au statut `published`, jamais l'historique ou le brouillon. Les vues publiques
se rafraîchissent régulièrement et les réponses CMS ne sont pas mises en cache.

## 4. Persistance et concurrence

Aucune nouvelle migration n'est créée, appliquée ou rejouée pendant cette étape.

- Une sauvegarde ajoute un snapshot ; elle ne réécrit pas une ancienne révision.
- Une édition publiée déplace uniquement le pointeur privé.
- La publication promeut explicitement le brouillon sauvegardé.
- Les mutations existantes verrouillent la ligne article et vérifient `version`.
- Une version client périmée reçoit 409 sans écrasement silencieux.
- Les numéros de révision sont calculés sous ce verrou.
- L'action et son audit sont atomiques. Un échec d'audit annule la transaction.
- Les réponses de succès sont renvoyées seulement après validation du commit.
- Dépublication et archivage préservent les snapshots et le journal.

## 5. Sécurité et médias

- Autorisation Founder côté serveur pour toutes les routes privées, y compris
  les médias ; contrôles d'origine et limitation des mutations réutilisés.
- Aucun second rôle ou mécanisme d'authentification.
- Validation stricte des objets, types, longueurs, catégories et références.
- Corps textuel limité à 100 000 caractères, 150 blocs ; galerie de 12 images maximum.
- Aucun HTML brut, iframe libre, URL vidéo arbitraire ou SVG actif.
- Images ≤20 MiB, vidéos ≤100 MiB, en conservant les quotas existants.
- Publication refusée sans titre/signature/contenu requis, avec date future,
  image sans alternative textuelle ou médias sans attestation de droits.
- Les références partenaire correspondent aux identifiants du catalogue existant,
  enregistrés sous forme de chaînes ; aucun outil Partners n'est ajouté.
- Seuls les nouveaux téléversements **éditoriaux** terminés et appartenant au
  Founder peuvent être attachés. Connaître l'ID d'un fichier privé/payant ne suffit pas.
- Téléversement temporaire privé, copie vers un objet éditorial final non couvert
  par l'URL PUT, seconde vérification des octets avant état `ready`.
- La finalisation verrouille le registre pour éviter les courses entre requêtes.
- Images et vidéos publiques exigent que l'ID figure dans la version actuellement
  publiée de cet article ; dépublier ferme ces nouvelles requêtes médias.
- Diffusion des vidéos avec gestion de `Range` et streaming ; pas d'annulation
  anticipée du SDK cloud lors d'un départ du navigateur.
- Aucune URL de bucket privée dans les réponses éditoriales publiques.

La confirmation des droits demeure une déclaration du Founder, pas une
certification juridique automatique. Dépublier ne supprime pas les copies déjà
téléchargées. Les fichiers temporaires peuvent rester après finalisation ou
échec ; aucun nettoyage automatique destructif n'est ajouté.

## 6. Fichiers principaux

Créés :

```text
artifacts/api-server/src/routes/newsPublishing.ts
artifacts/api-server/src/services/newsPublishing.ts
artifacts/api-server/src/services/newsValidation.ts
artifacts/api-server/test/news-publishing.test.mjs
artifacts/web/src/lib/news-cms.ts
artifacts/web/src/pages/member/FounderNews.tsx
artifacts/web/src/pages/news/cms-detail.tsx
artifacts/web/src/components/news-cms/ArticleEditor.tsx
artifacts/web/src/components/news-cms/BodyEditor.tsx
artifacts/web/src/components/news-cms/HistoryPanel.tsx
artifacts/web/src/components/news-cms/MediaUpload.tsx
artifacts/web/src/components/news-cms/NewsRenderer.tsx
artifacts/web/src/components/news-cms/PublicNewsList.tsx
artifacts/web/src/components/news-cms/fields.tsx
docs/FOUNDER-NEWS-CMS-IMPLEMENTATION.md
```

Modifiés :

```text
artifacts/api-server/src/app.ts
artifacts/api-server/src/routes/index.ts
artifacts/api-server/src/services/networkFiles.ts
artifacts/web/src/components/founder/founder-workspace-config.ts
artifacts/web/src/pages/member/index.tsx
artifacts/web/src/pages/news/index.tsx
artifacts/web/src/pages/news/detail.tsx
lib/api-spec/openapi.yaml
.agents/memory/project-control.md
```

Sorties régénérées :

- `lib/api-client-react/src/generated/api.ts` et `api.schemas.ts`.
- `lib/api-zod/src/generated/api.ts` et les types référencés sous `generated/types/`.

Le parseur JSON de l'action éditoriale a une limite de 768 KiB ; les autres API
conservent leur limite de 32 KiB. Le service fichiers conserve son comportement
initial par défaut ; le chemin éditorial est une option réservée au nouveau module.

## 7. Vérifications réalisées

Commande :

```sh
node --test artifacts/api-server/test/news-publishing.test.mjs \
  artifacts/api-server/test/preview-startup.test.mjs \
  lib/db/test/news-migration-static.test.mjs
```

**28 tests réussis :**

- 14 contrôles News : validation, champs non autorisés, médias, brouillon/public,
  conflits, restauration, archivage, audit, projection publique, slug et pagination.
- 7 contrôles du garde-fou de démarrage, uniquement en environnement simulé.
- 7 contrôles statiques du schéma/migration, sans SQL exécuté.

Les tests métier utilisent un dépôt simulé transactionnel : ils n'ouvrent ni base,
ni serveur, ni connexion Stripe. Le contrôle d'accès des nouvelles routes inclut
une inspection statique du raccordement aux protections existantes ; ce n'est
pas un test HTTP authentifié de Clerk.

Également réussis :

- génération OpenAPI et compilation des bibliothèques ;
- vérification TypeScript de l'API ;
- vérification TypeScript du frontend après les derniers correctifs ;
- compilation de l'API ;
- redémarrage du workflow API existant après autorisation et recontrôle du
  garde-fou, avec confirmation du mode développement sans bootstrap Stripe ;
- capture de `/news` après redémarrage, sans erreur de ressource dans les
  journaux du navigateur (seul avertissement Clerk sur les clés de développement).

**12 contrôles HTTP réels réussis**, via le domaine de développement :

| Contrôle | Résultat |
| --- | --- |
| Santé `/api/healthz` | 200 |
| Liste `/api/news/articles` | 200, liste vide, `private, no-store` |
| Pagination invalide `page=0` | 400 |
| Article inexistant | 404 |
| Média d'un article inexistant | 404 |
| Liste Founder sans connexion | 401 |
| Options Founder sans connexion | 401 |
| Détail Founder sans connexion | 401 |
| Média privé sans connexion | 401 |
| Action éditoriale sans connexion | 401 |
| Demande de téléversement sans connexion | 401 |
| Finalisation sans connexion | 401 |

Les requêtes privées refusées ne créent aucun brouillon ou téléversement. Aucune
mutation authentifiée ou publication de contenu de test n'a été effectuée.
Les 28 tests hors ligne, contrôles TypeScript et compilation mentionnés plus
haut restent les résultats de l'étape d'implémentation ; aucun code applicatif
n'a changé pendant cette vérification de redémarrage.

Le contrôle global du dépôt avait précédemment signalé une erreur externe au
module News dans `scripts/src/store-person-directory.ts` (import hors `rootDir`).
Ce script n'est pas modifié ni présenté comme corrigé dans cette livraison.

## 8. Limites et point d'arrêt

Le module n'est **pas encore validé de bout en bout avec le Founder** :

- aucun cycle réel créer/recharger/publier/dépublier n'a été exécuté ;
- les refus HTTP anonymes sont confirmés ; le refus d'un membre ordinaire
  connecté et le parcours Founder authentifié restent à vérifier ;
- les médias réels, le partage mobile et le comportement des protections de
  navigation doivent encore être vérifiés ;
- les métadonnées SEO sont côté React ; aucun nouveau rendu serveur pour les
  robots de partage n'est ajouté ;
- la lecture QuickTime dépend du navigateur et des codecs ; aucune conversion
  vidéo automatique n'est ajoutée ;
- publication planifiée, traductions automatiques, emails, médiathèque générale,
  autres modules et déploiement restent hors périmètre.

## 9. Prochaine étape exacte

L'API de développement tourne désormais avec les nouvelles routes. L'étape
restante est une validation avec une **vraie session Founder** : créer et recharger
un brouillon, vérifier son absence du public, publier explicitement, modifier sans
changer la version publique, restaurer en privé, dépublier et contrôler les médias.
Vérifier également les conflits entre onglets et le refus d'un compte ordinaire.

L'outil de contrôle ne dispose pas d'une telle session légitime. Ne pas inventer
une session Founder ou modifier l'identité autorisée pour lever ce blocage.
Conserver `TOMI_PREVIEW_SKIP_STRIPE_INIT` et les vérifications d'environnement ;
ne pas changer les marqueurs runtime ni les règles de production.
Ne pas rejouer la migration, publier le site ou démarrer un autre module.
