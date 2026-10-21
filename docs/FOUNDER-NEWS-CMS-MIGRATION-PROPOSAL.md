# TOMI — Proposition de migration pour News & Publishing

**Statut actualisé : architecture approuvée et migration appliquée en développement
sur l'accord explicite précédent, avant réception de la nouvelle directive de
préparation uniquement.** Le CMS n'est pas implémenté. Aucune autre exécution,
implémentation applicative ou mise en route de serveur n'est autorisée à ce stade.
Voir `docs/FOUNDER-NEWS-CMS-MIGRATION-REVIEW.md` pour le SQL généré exact,
les contrôles statiques et la chronologie. Le présent document conserve la
proposition initiale ; ses étapes « après approbation » ne sont pas une nouvelle
autorisation d'exécution.

## 1. Périmètre

Première phase seulement : neuf types de contenus éditoriaux, édition,
brouillon privé, aperçu privé, publication, dépublication, archivage et historique.
Les espaces Partners, Members, Payments, le Page Editor et les notifications ne
sont pas autorisés par cette étape. Aucun envoi d'email, déploiement ou accès aux
données de production.

## 2. Éléments existants réutilisés

- Session Clerk, identité Founder et contrôles serveur existants :
  `networkAuth`, `requireFounder`, `networkWrite`.
- Workspace `/member/founder` et identité visuelle actuelle.
- PostgreSQL/Drizzle et processus de migrations auditées du projet.
- Fichiers privés dans App Storage et registre `network_uploads`, sans rendre
  les objets du bucket publics.
- Journal `network_audit`, adapté à l'identité `ecosystem_members` utilisée par
  l'autorisation Founder.
- Pages `/news` et `/news/:slug`, composants éditoriaux, partage et animations,
  en les raccordant aux nouveaux contenus sans reconstruire les pages.
- Référentiels publics de partenaires et programmes : références seulement,
  sans créer leur CMS ou publier automatiquement un partenaire.

### État constaté

`media_items` contient un stockage générique avec un corps texte, un statut et
une URL média. L'API `newsArchive.ts` l'utilise avec le type `press-coverage-v1`
pour les publications historiques de médias tiers. Ce système n'est pas un
éditeur d'articles révisionnés.

Les articles éditoriaux et certaines actualités vidéo publiques sont actuellement
définis dans les fichiers frontend `news-data.ts` et `editorial-news.ts`.

Deux requêtes **en lecture seule sur les métadonnées de développement** ont
confirmé les colonnes des tables existantes et l'absence de tables dont le nom
contient news/article/revision/publish. Aucun contenu membre n'a été consulté.

### Pourquoi une migration est recommandée

Il serait techniquement possible de ranger de nouveaux documents JSON dans
`media_items.body`. Cela ne fournit toutefois pas les références relationnelles
entre article, brouillon et version publiée, ni les contraintes de révision
proposées ici. Ce n'est pas la conception retenue pour un CMS durable.

Deux tables dédiées permettent de séparer identité de l'article et snapshots de
contenu, de maintenir l'archive presse intacte et d'empêcher qu'une sauvegarde de
brouillon ne remplace accidentellement le contenu public.

## 3. Schéma relationnel exact proposé

Les noms ci-dessous devront être vérifiés une nouvelle fois à la génération.
Nouveaux objets uniquement, sans modification des lignes ou colonnes existantes.
Le SQL exprime le schéma à approuver ; il n'est pas un script à exécuter maintenant.

```sql
CREATE TABLE public.news_articles (
  id serial PRIMARY KEY,
  slug varchar(160) NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 0,
  draft_revision_id integer,
  published_revision_id integer,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT news_articles_slug_format
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT news_articles_status
    CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT news_articles_version
    CHECK (version >= 0),
  CONSTRAINT news_articles_publication_reference
    CHECK (
      status <> 'published'
      OR (published_revision_id IS NOT NULL AND published_at IS NOT NULL)
    )
);

CREATE TABLE public.news_article_revisions (
  id serial PRIMARY KEY,
  article_id integer NOT NULL
    REFERENCES public.news_articles(id) ON DELETE RESTRICT,
  revision_no integer NOT NULL CHECK (revision_no > 0),
  snapshot jsonb NOT NULL,
  created_by_member_id integer
    REFERENCES public.ecosystem_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT news_article_revisions_article_number UNIQUE (article_id, revision_no),
  CONSTRAINT news_article_revisions_article_id UNIQUE (article_id, id),
  CONSTRAINT news_article_revisions_snapshot_object
    CHECK (jsonb_typeof(snapshot) = 'object'),
  CONSTRAINT news_article_revisions_snapshot_version
    CHECK ((snapshot -> 'schemaVersion') IS NOT DISTINCT FROM '1'::jsonb)
);

ALTER TABLE public.news_articles
  ADD CONSTRAINT news_articles_draft_revision_fk
  FOREIGN KEY (id, draft_revision_id)
  REFERENCES public.news_article_revisions(article_id, id)
  ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public.news_articles
  ADD CONSTRAINT news_articles_published_revision_fk
  FOREIGN KEY (id, published_revision_id)
  REFERENCES public.news_article_revisions(article_id, id)
  ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX news_articles_public_listing_idx
  ON public.news_articles (published_at DESC, id DESC)
  WHERE status = 'published';
```

Les contraintes composites empêchent de rattacher à un article une révision
appartenant à un autre article. Les séquences des deux clés `serial` sont les
seuls autres objets créés automatiquement.

### Contrat exact du snapshot version 1

Les champs sont obligatoirement présents ; les champs facultatifs valent `null`
ou un tableau vide. Validation serveur stricte, sans propriétés inconnues :

| Champ | Type et limites proposés |
|---|---|
| `schemaVersion` | entier littéral `1` |
| `title` | texte normalisé, 0 à 200 caractères ; au moins 1 caractère pour publier |
| `subtitle` | texte, 300 caractères maximum, ou `null` |
| `category` | une des neuf valeurs ci-dessous |
| `cover` | référence image `{uploadId, alt, credit}` ou `null` |
| `video` | `{kind: "upload", uploadId}` ou `{kind: "embed", provider, videoId}` ou `null` |
| `body` | tableau de blocs structurés décrit ci-dessous |
| `additionalImages` | tableau de références image, 12 au maximum |
| `author` | nom de signature public, 120 caractères maximum, ou `null` |
| `publicationDate` | date ISO avec fuseau ou `null` ; pas de planification automatique |
| `relatedPartnerKey` | identifiant canonique du catalogue partenaire existant, ou `null` |
| `relatedProgrammeSlug` | slug canonique du programme existant, ou `null` |
| `seoTitle` | texte, 70 caractères maximum, ou `null` |
| `seoDescription` | texte, 180 caractères maximum, ou `null` |
| `mediaRightsConfirmed` | booléen ; confirmation explicite requise pour publier des médias |

`title` peut être vide uniquement pour un brouillon. Publier exige un titre, une
signature et un corps non vide, ou une vidéo valide pour une actualité vidéo.
L'absence de couverture est affichée honnêtement, sans image factice.

Les neuf catégories :

```
news
video-news
partnership-announcement
official-announcement
opportunity
press-release
event-announcement
humanitarian-update
ecosystem-update
```

Blocs du corps, sans HTML brut :

- `{type: "paragraph", text}` ;
- `{type: "heading", level: 2 | 3, text}` ;
- `{type: "quote", text, attribution: string | null}` ;
- `{type: "list", ordered: boolean, items: string[]}` ;
- `{type: "image", uploadId, alt, credit: string | null, caption: string | null}`.

Limites : 150 blocs, 100 000 caractères cumulés de texte, 50 éléments par liste.
Les champs `alt` et `caption` sont limités à 300 caractères, les crédits à 200.
Les `uploadId` sont des identifiants texte du registre existant, pas des chemins
de bucket, URLs signées ou URLs externes arbitraires.

La confirmation des droits est une déclaration du Founder, pas une certification
juridique automatique ; elle est conservée avec le snapshot.

Les vidéos intégrées utilisent uniquement un fournisseur autorisé (`youtube`
ou `vimeo`) et un identifiant validé. Aucun HTML d'iframe ou JavaScript saisi
par l'utilisateur. Les médias téléversés restent soumis aux limites existantes
et à une validation des octets, du format réel, de la propriété et de l'état
`ready`. Aucun SVG actif accepté comme image de publication.

La date affichée est celle du snapshot publié, ou la date serveur de publication
si aucune date éditoriale n'est fournie. Une date future est refusée à la
publication tant qu'un mécanisme de planification n'a pas été autorisé.

## 4. Transactions, historique et confidentialité

- Chaque sauvegarde crée un nouveau snapshot ; aucune route d'édition ou de
  suppression d'une ancienne révision ne sera exposée.
- Une sauvegarde d'un article publié modifie uniquement `draft_revision_id`.
- La publication valide le snapshot et les médias, puis met à jour le pointeur
  publié et le statut dans une transaction.
- `version` est incrémenté pour chaque mutation. Une version client périmée
  produit un conflit explicite, sans écraser le travail d'un autre onglet.
- Le numéro d'une révision est monotone, attribué sous verrou de l'article.
- Sauvegarde, publication, dépublication et archivage ajoutent dans la même
  transaction une entrée `network_audit`, avec des actions préfixées `news.`,
  `target_id = article.id` et des détails JSON comprenant version et révision.
- L'acteur de révision et d'audit vient du serveur, jamais du formulaire.
- La suppression éventuelle d'un membre peut anonymiser l'acteur de révision
  sans modifier le snapshot éditorial. Aucun effacement de compte n'est ajouté.
- Dépublier conserve les révisions mais ferme l'accès public. Archiver ne
  supprime ni article, ni journal, ni fichier.
- Les endpoints publics sélectionnent seulement `status = 'published'` et le
  snapshot désigné par `published_revision_id`, jamais le brouillon ou l'historique.
- L'aperçu est une vue privée authentifiée, pas un lien public avec un identifiant
  supposé difficile à deviner.
- Les nouveaux fichiers sont privés. Leur diffusion publique vérifie qu'ils
  figurent dans une révision actuellement publiée. Les actifs de certification,
  documents privés ou fichiers payants ne deviennent jamais éligibles par
  simple connaissance d'un identifiant.
- Les réponses privées sont `private, no-store`. Les réponses et médias CMS
  publics ne doivent pas rester servis par un cache après dépublication.
  Dépublier ne peut pas effacer une copie déjà téléchargée par un visiteur.

## 5. Intégration publique prévue, non réalisée

Les endpoints d'articles seront distincts de l'archive presse :

- publics : `/api/news/articles` et `/api/news/articles/:slug` ;
- administration Founder : espace dédié `/api/founder/news` ;
- médias : route contrôlée liée à l'article publié, pas accès direct au bucket.

Le contrat OpenAPI et les clients générés précéderont leur utilisation.
La page News existante conserve son archive presse, ses animations et les
contenus historiques. Une section éditoriale reçoit les articles CMS publiés.
La page de détail utilise les mêmes composants, une URL stable et les métadonnées
SEO du snapshot publié. Le partage utilise cette URL publique.

Les slugs déjà utilisés par les contenus statiques sont réservés. Ils ne sont
pas importés ou remplacés automatiquement. Un slug CMS est conservé après la
première publication pour ne pas casser les liens.

## 6. Opérations de migration et compatibilité

Après approbation seulement :

1. Définir les deux tables Drizzle et leurs contraintes/index.
2. Générer la migration avec le processus `generate → review → migrate`.
3. Vérifier que le diff contient seulement les créations et contraintes
   proposées ; s'arrêter sur toute modification inattendue de tables existantes.
4. Appliquer uniquement à la base de développement autorisée.
5. Contrôler les contraintes, puis implémenter API et interfaces.

Aucun `push --force`, migration Stripe, modification de l'archive, reprise de
données, seed, transformation des abonnements ou import de contenus publics
existants. Les tables actuelles restent identiques. Les entrées d'audit News
n'apparaissent qu'à l'utilisation future du CMS, pas à la migration.

Aucune migration de production n'est autorisée. Un éventuel passage en
production doit faire l'objet d'un accord et du processus de publication distinct.

## 7. Retour arrière

Le retour arrière prioritaire est applicatif : désactiver les nouvelles routes
et retirer leur intégration, en conservant les tables, révisions et objets
privés. Les pages et archives actuelles continuent à fonctionner.

Ne jamais supprimer automatiquement les tables pour revenir à l'ancien code.
Si elles contiennent des contenus, les conserver et prévoir une sauvegarde privée
autorisée avant toute opération destructive. Une suppression éventuelle des deux
tables vides nécessiterait un accord distinct, la suppression préalable de leurs
contraintes croisées et une revue SQL. Aucun `CASCADE` destructif sur l'existant,
aucun effacement des journaux.

## 8. Vérifications à réaliser après approbation

- Persistance réelle après rechargement.
- Refus des accès sans session et membre ordinaire, y compris mutations.
- Aucun brouillon/révision/média privé dans les réponses publiques.
- Éditer un article publié ne change pas sa version visible.
- Publication, dépublication et archivage effectifs dans la liste et au détail.
- Conflits entre deux onglets : pas d'écrasement silencieux.
- Validation des médias, embeds, droits d'utilisation et entrées de texte.
- Transactions atomiques avec le journal existant.
- Régression de l'archive presse et des contenus statiques.
- Interfaces ordinateur/mobile et navigation clavier.

Lors de la rédaction initiale de cette proposition, seuls les sources et les métadonnées de développement avaient été
inspectées. Aucun test du futur CMS, aucune migration, aucun démarrage de serveur,
aucune opération Stripe et aucun déploiement n'avaient été effectués.
Ce constat historique ne décrit pas l'état actuel de la migration ; voir le statut
actualisé en tête de document.
