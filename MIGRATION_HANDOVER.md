# TOMI — Dossier de transfert GitHub

## État : audit de synchronisation GitHub (snapshot avant le commit de ce dossier)

Ce document est un inventaire de transfert, pas une autorisation de déploiement.
L’application originale, ses données, son DNS et ses comptes externes restent inchangés.

- Dépôt : https://github.com/ngampastephane62-afk/THE-ONE-MOVEMENT
- Propriétaire GitHub indiqué par le chemin du dépôt : `ngampastephane62-afk`.
  Ce constat ne prouve pas la propriété juridique ni l’accès du futur compte Founder.
- Remote de cet environnement : `https://github.replit.internal/ngampastephane62-afk/THE-ONE-MOVEMENT`.
  Utiliser l’URL GitHub publique ci-dessus pour importer depuis le compte destinataire.
- Branche : `main`.
- HEAD local de code avant cette mise à jour : `958146256ddfdd30dadf53383753905d35454deb`.
- HEAD de `origin/main` après `git fetch origin main` : `871ebf115319449f18f94260bfedd69e3767a379`.
- À ce relevé, `main` local avait 16 commits d’avance et aucun retard (`0 16`,
  comparaison `origin/main...HEAD`) ; le commit distant était l’ancêtre direct,
  sans divergence.
- L’arbre de travail était propre avant la modification de ce dossier.
- `git diff --check` n’a relevé aucun problème d’espacement dans les changements.
- La revue des 16 commits n’a trouvé aucun fichier `.env`, export de base,
  clé privée ou chemin de fichier indiquant un export de données de membres ajouté.
  Un motif de clé dans
  `direct-call-policy.test.mjs` correspond à une valeur de test vide, pas à un
  secret. Cette revue ne certifie pas le contenu des anciens fichiers binaires.
- Les six chemins LFS suivis dans `HEAD` passent `git lfs fsck --objects`.
  `git lfs push --dry-run origin main` n’a signalé aucun objet à envoyer.
  Cela vérifie l’état LFS observé, pas l’import dans un autre compte.
- Le commit documentaire créé pour cette synchronisation et l’issue effective
  du push sont indiqués dans le rapport de livraison. Le SHA du commit qui
  contient ce document est communiqué après sa création.

## Décision de conservation et fichiers volumineux

Le dépôt suit déjà 306 fichiers sous `attached_assets/`, dont :

- `Business_License_1784473751361.pdf` : document commercial potentiellement privé ;
- `00_FOUNDER_RAW_MEDIA_DROP-20261002T153244Z-1-001_1790955523168.zip` :
  archive brute de 1 636 954 427 octets, suivie par Git LFS.
  Son répertoire contient 138 entrées, dont images, vidéos et un PDF.

Ces deux fichiers sont également présents dans l’arbre du commit distant inspecté.
Informé de leur présence et du risque de confidentialité, le demandeur a répondu
« rien exclure ». Tous les fichiers déjà suivis sont donc conservés sans retrait.
Cette décision ne certifie pas l’absence de données personnelles dans les anciens
documents. Aucun contenu de ces documents n’a été reproduit ici.
Ne pas effacer ou réécrire l’historique sans autorisation explicite.
Un retrait d’un futur commit ne retire pas les anciennes versions de l’historique.

Les changements des 16 commits sont du code, des tests, des migrations SQL,
des schémas générés et de la documentation. Le scan ciblé des changements
n’a trouvé aucune valeur réelle de clé ou de jeton selon les motifs contrôlés.
Les fichiers commerciaux
et l’archive cités ci-dessus existaient déjà à la base distante avant ces
commits ; ils n’ont pas été modifiés ni inclus comme nouveaux objets dans ce
push. Le contenu de l’archive et des anciens documents binaires n’a pas été
audité : ne pas certifier leur confidentialité sur la seule base de ce scan.

Six chemins sont suivis par LFS, de 54 Mio à environ 1,52 Gio ; plusieurs chemins
peuvent référencer le même objet LFS. Les objets référencés par `HEAD` sont
présents et passent le contrôle d’intégrité local. Le dry-run du push n’a pas
signalé d’objet manquant à envoyer à `origin`. Le compte destinataire devra
néanmoins avoir accès au dépôt et à LFS ; un clone de pointeurs seuls ne fournit
pas les médias.

## Architecture et exigences d’exécution

Monorepo pnpm/TypeScript :

- `artifacts/web` : React 19, Vite 7, Wouter, interfaces publiques et membres,
  My Space, Founder/Command Center, outils éditoriaux, traductions.
  Entrées : `src/main.tsx` et `src/App.tsx`.
- `artifacts/api-server` : Express 5, Clerk, services et routes sous `src/`,
  entrée `src/index.ts`, build esbuild `build.mjs`, sortie `dist/index.mjs`.
- `artifacts/api-server` et `artifacts/web` incluent le pilote d’appels privés
  Daily (API et interface membre). La migration de budget/session d’appel a été
  appliquée en développement lors d’une opération antérieure autorisée ; les
  appels réels entre deux comptes n’ont pas été vérifiés. Ne pas déclarer ce
  pilote prêt pour la production.
- `lib/db` : PostgreSQL, Drizzle, schémas dans `src/schema/`.
- `lib/shared` : contrats et règles partagés.
- `lib/api-spec/openapi.yaml`, `lib/api-zod`, `lib/api-client-react` :
  contrat OpenAPI et clients/validateurs générés.
- `artifacts/mockup-sandbox` : environnement de conception séparé.
- `scripts`, `docs`, tests et fichiers de configuration : à conserver.

Conserver `pnpm-lock.yaml`, `pnpm-workspace.yaml`, les manifests et les
références TypeScript. Prévoir une version Node compatible Vite 7
(Node 22.12+ recommandé), pnpm compatible avec le lockfile, Git LFS et
les outils multimédias appelés par les scripts concernés.

Installation cible : `pnpm install --frozen-lockfile`.
Contrôles : `pnpm run typecheck`, puis builds web et API.
Ne pas exécuter de seed ou de migration automatiquement à l’import.

## Base : schémas, migrations et transfert des données

- Schémas : `lib/db/src/schema/`.
- Migrations du journal Drizzle : 23 entrées de
  `0000_classy_blade.sql` à `0022_amazing_rachel_grey.sql`, avec métadonnées `meta/`.
  Le dépôt contient aussi `0021_community_communications.sql`, qui n’est pas une
  entrée du journal courant ; vérifier son statut avant toute utilisation.
  Inclut les extensions profils/confidentialité, Connect et le pilote d’appels.
- Revues préparatoires : `lib/db/review/` et `lib/db/migration-reviews/`.
- Configuration : `lib/db/drizzle.config.ts`.
- Commandes déclarées : `pnpm --filter @workspace/db db:generate`,
  `db:status`, `db:migrate`.

Les fichiers SQL ne contiennent pas les membres, profils, publications, messages,
statistiques, brouillons ni autres enregistrements de production.
Préparer une sauvegarde chiffrée et un transfert séparé avec un responsable
autorisé ; ne jamais placer un dump dans GitHub.
Vérifier les migrations déjà appliquées avant toute restauration/migration.
Conserver les identifiants et relations avec Clerk, Stripe et les objets média.
Ne pas utiliser `db:push` ni supprimer des données pour réconcilier le schéma.

## Variables : noms uniquement

Noms détectés dans les sources et besoins connus :

- `DATABASE_URL`
- `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`,
  `VITE_CLERK_PROXY_URL`
- `SESSION_SECRET`, `TOMI_FOUNDER_EMAIL`
- `DAILY_API_KEY` (Secret du fournisseur d’appels ; ne jamais copier sa valeur
  dans GitHub). `TOMI_DAILY_PILOT` est un indicateur de développement, pas un Secret.
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PRIVATE_OBJECT_DIR`,
  `PUBLIC_OBJECT_SEARCH_PATHS`
- `TOMI_PROFILE_REMINDER_FROM`, `TOMI_PUBLIC_SITE_URL`
- `TOMI_PREVIEW_SKIP_STRIPE_INIT`, `TOMI_HUMANITARIAN_LIVE_AUTHORIZED`
- `NODE_ENV`, `PORT`, `BASE_PATH`, `LOG_LEVEL`
- Variables injectées par Replit : `REPLIT_DEPLOYMENT`, `REPLIT_DEV_DOMAIN`,
  `REPLIT_DOMAINS` et authentification des connecteurs gérée par la plateforme.

Les secrets et autorisations des connecteurs ne sont pas des fichiers source.
Les recréer dans le coffre du projet destinataire, jamais dans le chat ou Git.
Ne pas copier aveuglément les variables internes éphémères de la plateforme.

## Authentification et accès Founder

Conserver Clerk comme fournisseur unique. Vérifier la stratégie de conservation
ou de migration du tenant et des identifiants utilisateurs avant de changer
les clés, domaines autorisés, redirections et proxy.
Le contrôle serveur existant utilise notamment `TOMI_FOUNDER_EMAIL` et l’identité
Clerk vérifiée ; ne pas supposer qu’importer le dépôt donne les droits Founder.
Tester le compte Founder réel et le refus des comptes ordinaires.
Ne pas modifier les rôles ou recréer les membres pendant le transfert de code.

## Paiements et intégrations

- Stripe : reconnexion autorisée du même compte marchand ou décision explicite
  du propriétaire. Préserver produits, prix, clients, abonnements et identifiants.
  Examiner les services Stripe et StripeSync avant tout démarrage cible :
  celui-ci ne doit pas créer de webhook, synchroniser ou migrer à l’insu du propriétaire.
- Resend : reconnecter via l’intégration, vérifier le domaine expéditeur,
  `TOMI_PROFILE_REMINDER_FROM` et l’URL officielle. Ne pas envoyer de rappels
  pendant les essais de transfert.
- Daily : le pilote dépend de `DAILY_API_KEY`, à configurer séparément pour
  chaque environnement par l’Owner. Ne jamais recopier la valeur du Secret
  depuis le projet source ; aucune activation ni validation de production n’est
  couverte par cette synchronisation Git.
- Clerk : tenant, clés et domaines comme indiqué ci-dessus.
- App Storage : autorisations et stockage séparés du code.

Le transfert ne change ni le propriétaire Stripe ni le bénéficiaire des paiements.
Ne pas activer des fonctions commerciales indisponibles pour valider l’import.

## Médias et dépendances externes

Conserver les assets versionnés réellement utilisés, les fichiers publics et
les références dans les contenus. Les médias App Storage, uploads membres,
fichiers privés, publications payantes et variantes transcodées doivent être
inventoriés et copiés séparément avec leurs droits d’accès et métadonnées.
Les chemins d’objets stockés en base doivent rester cohérents après transfert.
Ne jamais rendre un fichier privé public pour réparer un chemin.

Les exclusions `.gitignore` et `.replitignore` couvrent dépendances, builds,
caches, sorties générées et des uploads de référence/anciens fichiers lourds.
Attention : une règle d’exclusion ne retire pas les fichiers déjà suivis.
Des uploads ignorés existent encore localement, dont vidéos originales et
captures ; leur sauvegarde séparée doit être décidée après distinction entre
référence, contenu nécessaire et document privé.
Les caches navigateur, cookies, rapports de plantage et `.local` ne sont pas
des sources à transférer.

## Configuration de publication à préserver

Les configurations actives sont dans :

- `artifacts/web/.replit-artifact/artifact.toml` :
  chemin `/`, port développement 22333, build Vite,
  site statique `artifacts/web/dist/public`, fallback SPA `/index.html`.
- `artifacts/api-server/.replit-artifact/artifact.toml` :
  chemin `/api`, port 8080, build API, exécution Node,
  contrôle de démarrage `/api/healthz`.

Conserver `.replit` et la structure des artifacts. L’import GitHub dans le
nouveau compte ne transfère pas automatiquement les secrets, connecteurs,
données ou médias externes. Ne pas publier ni modifier DNS/domaines durant
la préparation. Prévoir une validation privée et un retour arrière avant
toute bascule ultérieure, autorisée séparément.

## Vérification avant validation finale

- [ ] Revue confidentialité des documents et médias suivis, y compris archive.
- [ ] Contrôle des secrets et données personnelles de tous les commits à envoyer.
- [x] Décision explicite de conserver les fichiers déjà suivis, sans réécriture.
- [ ] Vérification des fichiers ignorés nécessaires à l’exécution.
- [ ] Objets LFS disponibles pour le compte destinataire.
- [ ] Accès GitHub du Founder confirmé ; visibilité du dépôt vérifiée.
- [ ] Commit du dossier et des seules sources légitimes.
- [ ] Nouvelle lecture distante : arrêt si divergence, aucun force-push.
- [ ] Push effectif et correspondance du SHA distant avec le SHA final local.
- [ ] Import indépendant, installation figée et builds réussis.
- [ ] Sauvegardes privées base/médias et procédure de restauration validées.
- [ ] Tenant Clerk, Founder, intégrations et URL cible vérifiés.
- [ ] Parcours publics/membres/Founder, vidéos, traductions et fichiers privés testés.
- [ ] Aucune action de paiement, email réel, déploiement ou bascule DNS involontaire.

Les contrôles fonctionnels antérieurs ne certifient pas un nouveau compte cible.
La vérification de l’envoi effectif GitHub est fournie dans le rapport final.
Aucun import cible, transfert de données, déploiement ni bascule DNS n’est
autorisé ou réalisé par cette opération de conservation du code.
