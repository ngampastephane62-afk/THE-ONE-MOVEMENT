# Thanks the World — proposition soumise à approbation

Statut : SCHÉMA APPROUVÉ POUR PRÉPARATION ; SQL GÉNÉRÉ, NON APPLIQUÉ.

Le Fondateur a autorisé la préparation du schéma et du SQL uniquement. Les
définitions Drizzle et la migration sont désormais préparées dans le dépôt,
sans application à une base. Aucun compte, contenu ou fichier média modifié.
Voir `THANKS-THE-WORLD-MIGRATION-REVIEW.md` pour la revue et les vérifications.
La campagne reste non implémentée ; les sections ci-dessous conservent la
proposition approuvée et le rapport de l’inspection initiale.

## 1. Résultat de l’inspection

- `network_profiles` réutilise les comptes membres existants et conserve les
  paramètres d’activation, de suspension et les règles de confidentialité.
- `network_posts` possède texte, auteur, médias et un booléen `hidden`, mais pas
  de campagne, de pays, de titre, de consentement public ou de cycle de validation.
  `post.create` publie dans le réseau sans approbation préalable.
- `ThanksEmirates.tsx` utilise ce flux avec le préfixe `#ThanksEmirates` et un
  consentement à la visibilité dans le réseau connecté : ce n’est pas un
  consentement à une campagne publique internationale.
- `network_uploads` et `networkFiles.ts` proposent déjà un stockage privé, des
  URL PUT temporaires, la vérification du propriétaire, des métadonnées et
  signatures élémentaires. Vidéos MP4/WebM/QuickTime, plafond existant 100 Mio.
  La finalisation ne contrôle pas la durée, les codecs ou les pistes réellement
  décodables. Elle ne génère pas de miniature.
- Les routes média du réseau contrôlent l’accès des membres ; elles ne fournissent
  pas le contrat de diffusion publique d’une contribution approuvée.
- `network_likes`, `network_views`, `network_comments` et `network_reports`
  référencent des publications réseau, pas des contributions de campagne.
  Les vues sont dédupliquées par membre/publication et excluent l’auteur.
  Le like propre à l’auteur n’est pas exclu dans l’action actuelle.
- Le système éditorial limite les interactions à des identifiants éditoriaux
  autorisés. Il ne faut pas ouvrir cette liste à des identifiants arbitraires.
- `moderate.post` permet de masquer/restaurer une publication ; ce n’est pas
  une file de validation préalable. Les décisions sont déjà journalisées dans
  `network_audit`. Le Founder Workspace et `requireFounder` sont réutilisables.
- Le contrôle général `networkWrite` impose l’origine du site et une limite
  en mémoire par processus. Il ne suffit pas, seul, pour protéger un classement
  sur plusieurs instances.

**Conclusion :** employer un hashtag, un JSON dans le texte ou `hidden` comme
état de validation serait un contournement fragile. Une persistance dédiée est
nécessaire avant de livrer le flux réel demandé.

## 2. Schéma exact proposé

Sept tables additives. Noms et types ci-dessous constituent la proposition ;
aucune création n’est exécutée. Les états sont du `text` avec CHECK explicites,
pas de nouveaux enums PostgreSQL. Tous les horodatages sont `timestamptz`.
Les clés membres référencent `ecosystem_members.id`, nom physique confirmé
dans le schéma Drizzle existant.

### `gratitude_campaigns`

| Colonne | Type / contrainte |
| --- | --- |
| id | serial PRIMARY KEY |
| slug | text NOT NULL UNIQUE, CHECK format `^[a-z0-9]+(-[a-z0-9]+)*$` |
| parent_id | integer NULL REFERENCES gratitude_campaigns(id) ON DELETE RESTRICT |
| name | text NOT NULL, 1–120 caractères |
| description | text NOT NULL DEFAULT '', au plus 4000 caractères |
| status | text NOT NULL DEFAULT 'draft', CHECK draft/active/paused/archived |
| identity | jsonb NOT NULL DEFAULT '{}', objet ; contrat serveur fermé pour palette, style et références de médias autorisées |
| created_by | integer NOT NULL REFERENCES membre ON DELETE RESTRICT |
| updated_by | integer NOT NULL REFERENCES membre ON DELETE RESTRICT |
| created_at / updated_at | NOT NULL DEFAULT now() |

CHECK `parent_id IS NULL OR parent_id <> id`. Détection des cycles également
dans le service transactionnel. Index `(parent_id, status)`.
Seul Thanks the World est candidat à l’activation initiale après validation.
Les autres identités restent des brouillons jusqu’à décision explicite.
Aucune conversion automatique des témoignages Thanks Emirates existants.

### `gratitude_contributions`

| Colonne | Type / contrainte |
| --- | --- |
| id | serial PRIMARY KEY |
| author_id | integer NOT NULL REFERENCES membre ON DELETE CASCADE |
| campaign_id | integer NOT NULL REFERENCES gratitude_campaigns(id) ON DELETE RESTRICT |
| title | text NOT NULL DEFAULT '', au plus 160 caractères |
| body | text NOT NULL DEFAULT '', au plus 5000 caractères |
| country_code | text NULL, CHECK deux lettres ISO majuscules |
| theme | text NULL, CHECK country/community/culture/inspiration/peace-unity/positive-leadership/humanitarian-action/journey |
| status | text NOT NULL DEFAULT 'draft', CHECK draft/pending_review/published/rejected/hidden/archived |
| version | integer NOT NULL DEFAULT 1, CHECK > 0 |
| approved_version | integer NULL, CHECK > 0 et <= version |
| public_consent_at | NULL |
| consent_version | text NULL, au plus 80 caractères |
| rights_confirmed_at | NULL |
| featured | boolean NOT NULL DEFAULT false |
| decision_reason | text NOT NULL DEFAULT '', au plus 2000 caractères |
| reviewed_by | integer NULL REFERENCES membre ON DELETE SET NULL |
| reviewed_at / submitted_at / published_at | NULL |
| created_at / updated_at | NOT NULL DEFAULT now() |

CHECK published implique approved_version IS NOT NULL et approved_version = version, consentement et droits
confirmés, reviewed_at non NULL, titre non vide, pays et thème non NULL.
CHECK featured implique status = published.
Index `(campaign_id, status, published_at DESC, id DESC)`,
`(country_code, status, published_at DESC)`, `(author_id, updated_at DESC)`,
`(status, submitted_at)`.

Les brouillons peuvent être incomplets. Le service valide le pays contre le
référentiel international versionné, et vérifie texte significatif OU vidéo
validée avant soumission/approbation. Région et regroupement continental sont
dérivés du pays : aucune nationalité personnelle n’est écrite ni inférée.
Le membre peut choisir ces regroupements comme filtres pour trouver son pays,
pas enregistrer une combinaison géographique contradictoire.

### `gratitude_media`

| Colonne | Type / contrainte |
| --- | --- |
| id | serial PRIMARY KEY |
| contribution_id | integer NOT NULL REFERENCES gratitude_contributions(id) ON DELETE CASCADE |
| original_upload_id | text NOT NULL UNIQUE REFERENCES network_uploads(id) ON DELETE RESTRICT |
| playback_upload_id | text NULL UNIQUE REFERENCES network_uploads(id) ON DELETE RESTRICT |
| thumbnail_upload_id | text NULL REFERENCES network_uploads(id) ON DELETE RESTRICT |
| kind | text NOT NULL, CHECK image/video |
| processing_status | text NOT NULL DEFAULT 'pending', CHECK pending/processing/ready/failed |
| duration_ms | integer NULL, CHECK > 0 et <= 180000 |
| width / height | integer NULL, CHECK > 0 |
| position | integer NOT NULL DEFAULT 0, CHECK >= 0 |
| alt_text | text NOT NULL DEFAULT '', au plus 500 caractères |
| captions_upload_id | text NULL REFERENCES network_uploads(id) ON DELETE RESTRICT |
| failure_code | text NULL, code serveur non sensible, au plus 80 caractères |
| created_at / updated_at | NOT NULL DEFAULT now() |

UNIQUE `(contribution_id, position)`. Index `(processing_status, updated_at)`.
CHECK vidéo ready implique duration_ms non NULL et playback_upload_id non NULL.
La limite de nombre de médias est contrôlée transactionnellement au serveur :
une vidéo OU trois images au maximum par contribution dans cette première version.
L’original, les dérivés et les sous-titres demeurent privés dans le stockage.

### `gratitude_engagement`

| Colonne | Type / contrainte |
| --- | --- |
| id | serial PRIMARY KEY |
| contribution_id | integer NOT NULL REFERENCES gratitude_contributions(id) ON DELETE CASCADE |
| member_id | integer NOT NULL REFERENCES membre ON DELETE CASCADE |
| kind | text NOT NULL, CHECK view/like/share_intent |
| created_at | NOT NULL DEFAULT now() |

UNIQUE `(contribution_id, member_id, kind)`.
Index `(contribution_id, kind)`. Un unlike supprime la ligne correspondante.
`share_intent` mesure une action de partage, jamais un partage effectivement
effectué chez un tiers. Il n’entre pas dans le classement initial.
Les visiteurs anonymes peuvent consulter mais n’ajoutent pas de vues classantes.

### `gratitude_comments`

| Colonne | Type / contrainte |
| --- | --- |
| id | serial PRIMARY KEY |
| contribution_id | integer NOT NULL REFERENCES gratitude_contributions(id) ON DELETE CASCADE |
| author_id | integer NOT NULL REFERENCES membre ON DELETE CASCADE |
| body | text NOT NULL, 1–2000 caractères après trim |
| hidden | boolean NOT NULL DEFAULT false |
| created_at / updated_at | NOT NULL DEFAULT now() |

Index `(contribution_id, hidden, created_at, id)`.
Rendu texte seulement, sans HTML arbitraire.

### `gratitude_reports`

| Colonne | Type / contrainte |
| --- | --- |
| id | serial PRIMARY KEY |
| contribution_id | integer NOT NULL REFERENCES gratitude_contributions(id) ON DELETE CASCADE |
| comment_id | integer NULL REFERENCES gratitude_comments(id) ON DELETE SET NULL |
| reporter_id | integer NOT NULL REFERENCES membre ON DELETE CASCADE |
| reason | text NOT NULL, 3–2000 caractères après trim |
| status | text NOT NULL DEFAULT 'open', CHECK open/resolved/dismissed |
| resolved_by | integer NULL REFERENCES membre ON DELETE SET NULL |
| resolution_reason | text NOT NULL DEFAULT '', au plus 2000 caractères |
| resolved_at | NULL |
| created_at | NOT NULL DEFAULT now() |

Index `(status, created_at)`. Index unique partiel sur
`(contribution_id, reporter_id) WHERE status='open' AND comment_id IS NULL`,
et sur `(comment_id, reporter_id) WHERE status='open' AND comment_id IS NOT NULL`.
Le serveur vérifie qu’un commentaire signalé appartient à la contribution.

### `gratitude_rate_windows`

| Colonne | Type / contrainte |
| --- | --- |
| member_id | integer NOT NULL REFERENCES membre ON DELETE CASCADE |
| action | text NOT NULL, CHECK submit/upload/comment/like/view/share_intent |
| window_start | NOT NULL |
| count | integer NOT NULL DEFAULT 1, CHECK > 0 |

PRIMARY KEY `(member_id, action, window_start)`.
Index `(window_start)` pour purger les anciennes fenêtres.
Incrément atomique PostgreSQL avec seuil contrôlé dans la même opération.
Limites proposées : soumissions 5/heure, demandes d’upload 10/heure,
commentaires 10/10 minutes et 60/jour, likes 60/minute, vues et intentions de
partage 60/minute. Le quota média existant de 500 Mio/jour reste applicable.
Déduplication, interdiction des compteurs propres à l’auteur et contrôles de
compte s’ajoutent aux limites ; aucune promesse d’éliminer toute fraude.

### Journalisation réutilisée

Pas de nouvelle table d’audit. `network_audit` enregistre les actions
`gratitude.*` et `gratitude.campaign.*` avec type de cible, version, état
précédent/suivant et motif dans `detail` JSON sérialisé. Aucun jeton, URL signée
ou original privé dans le journal. Les décisions et changements d’état sont
atomiques avec leur entrée d’audit.

## 3. Réutilisation et migrations requises

Réutiliser les membres, profils, contrôles d’identité/Founder, règles de blocage,
composants du compte et du Founder Workspace, stockage et registre d’uploads,
lecture vidéo native, motifs de compteurs dédupliqués et journal existants.

Les petites tables d’interactions spécifiques évitent d’attacher une contribution
en attente à une publication réseau immédiatement visible, d’élargir les
identifiants éditoriaux ou de changer les clés étrangères de tous les contenus
existants. L’interface et les utilitaires peuvent être réutilisés ; pas de
seconde adhésion, de seconde identité ou de seconde infrastructure de stockage.

Après accord : définir ces sept tables, générer une migration additive,
examiner le SQL complet, présenter toute différence avec cette proposition,
puis appliquer uniquement à la base de développement dont l’environnement aura
été vérifié. Jamais `push --force`, jamais de migration automatique au démarrage.
Pas de backfill des posts, profils, vidéos ou consentements existants.
Activation initiale explicite du seul umbrella Thanks the World, journalisée.

## 4. Autorisations et confidentialité

- Utiliser l’identité existante ; aucune modification Clerk, abonnement ou rôle.
  Les membres authentifiés non suspendus peuvent préparer et soumettre sans
  paiement ni seuil d’invitations. Réutiliser `actor(res, false)` lorsque
  l’activation facultative du réseau ne doit pas conditionner cette campagne.
- Le serveur dérive author_id, reviewer et horodatages. Propriétaire : lire ses
  brouillons/statuts, modifier, soumettre, retirer/archiver. Aucun auto-agrément,
  même si le propriétaire est Founder ; ses contributions exigent un autre
  circuit de revue autorisé avant publication, sinon elles restent en attente.
- Founder existant seulement : examiner les médias privés, approuver, rejeter,
  demander correction, masquer, restaurer une version déjà approuvée, mettre
  en avant, gérer les campagnes. Motif obligatoire pour toute décision.
- Une correction invalide l’approbation précédente et retire immédiatement la
  contribution publique. Nouvelle soumission et nouvelle approbation requises.
  Comparaison de version et verrouillage évitent l’approbation d’une ancienne
  version pendant une modification concurrente.
- Feed public et profil public : seulement published + version approuvée courante
  + campagne active + consentement public + compte non suspendu +
  paramètres existants autorisant le profil public. Pour les médias, appliquer
  aussi le choix existant publicMedia. Aucun basculement automatique de ces choix.
  Un membre au profil privé voit clairement pourquoi son histoire n’est pas
  publiquement diffusable ; la revue ne force pas la publication.
- Endpoints propriétaires et Founder : `no-store`. Contrôle de visibilité sur
  chaque fichier, miniature et requête Range ; pas seulement sur la fiche.
  Retrait/suspension/confidentialité révoquent aussi les lectures média suivantes.
- Interactions réservées aux membres autorisés, avec blocages appliqués ;
  le signalement reste possible sans rétablir une communication bloquée.

## 5. Médias : proposition opérationnelle

Conserver les octets en App Storage et uniquement références/métadonnées en
PostgreSQL. Ajouter un scope réservé `gratitude-pending`, distinct de `network`
et `news-pending`, puis des dérivés privés validés.

Upload direct par URL PUT temporaire, progression navigateur, annulation,
gestion des erreurs et prévisualisation locale avant envoi. Limites proposées :
vidéo MP4/WebM/MOV, 100 Mio et 180 secondes ; images JPEG/PNG/WebP, 10 Mio/image.
Pas de PDF/audio/GIF dans cette campagne. Les restrictions client ne remplacent
pas le contrôle serveur.

Avant revue : vérifier propriétaire, taille réelle, signature, durée et pistes
avec un outil média à jour, sans réseau, avec limites de temps/mémoire et
suppression des métadonnées inutiles. Générer un dérivé lisible et une miniature
si le traitement est disponible ; échec explicite sinon, jamais « prêt ».
Les sous-titres WebVTT éventuels sont validés et servis comme texte, pas HTML.
La lecture native possède contrôles, titre, preload metadata/none, sans autoplay.
Pas de promesse d’enregistrement caméra direct dans cette première version.

**Protection indispensable :** interdire les références à ces uploads dans
`ownedMedia`, `post.create/edit`, `profile.media`, les finalisations génériques
et toute route réutilisant les uploads hors campagne. Auditer aussi les points
d’entrée Founder/News. Sinon un propriétaire pourrait attacher son original en
attente à un post pour contourner la revue. Le lecteur générique réseau ne doit
pas servir ces fichiers ; seule la route de campagne autorisée les délivre.
Ne pas exposer d’URL GET signée publique durable. Ne pas changer l’authentification
du stockage existant. Prévoir nettoyage différé, reprenable et sans supprimer
un objet encore référencé.

## 6. Modération, découverte et classement

Flux : draft → pending_review → published/rejected.
Correction demandée : rejected avec motif explicite → draft → pending_review.
Retrait membre : archived. Suspension d’une histoire : hidden.
Restauration Founder : published seulement si la même version reste approuvée,
le consentement valide et toutes les règles de visibilité satisfaites ;
sinon retour en revue. Aucun utilisateur ne peut envoyer directement published.

La campagne, les pays, les huit thèmes et les états sont validés côté serveur.
Le Founder voit texte, vidéo validée, consentement, version et raison ; il
dispose de la file, des actions, du suivi des signalements et de l’audit.
Une campagne brouillon/pausée ne reçoit pas de nouvelles soumissions publiques.

Découverte réelle et paginée : campagne, pays, regroupement continental,
récent, featured, vues uniques de membres, likes uniques, commentaires valides.
Ne compter ni comptes suspendus, ni actions de l’auteur dans le classement ;
exclure commentaires masqués et contributions retirées. Une vue classante
nécessite un signal de visibilité/lecture et reste au plus une par membre.
Un appel client ne prouve pas à lui seul une présence humaine : décrire les
compteurs comme dédupliqués, pas comme audience certifiée.
Pas de score inventé, de gagnant, de prix ou de période officielle.

## 7. Compatibilité et retour arrière

Risques à couvrir : collisions avec `/thanks-world` (répertoire existant),
confusion avec Thanks Emirates, fuite d’uploads par un autre module, anciennes
permissions de profil, requêtes concurrentes, formats vidéo mobiles, coût des
dérivés et contrôles anti-spam multi-instance.

Ne remplacer ni le répertoire existant ni les témoignages UAE. Préférer une
route dédiée `/thanks-the-world` et des onglets dans le compte/Founder actuels.
Ne jamais copier les motifs Kuba dans toutes les identités régionales.
Le fichier de référence « Museum of Art » n’a pas été identifié parmi les
pièces de cette demande : ne pas prétendre l’avoir visionné.

Retour arrière : désactiver les points d’entrée campagne et refuser les écritures,
garder les tables/objets privés et les audits pour ne perdre aucune contribution,
revenir au code compatible précédent. Aucune suppression de table ou de fichier
automatique. Une suppression définitive éventuelle exige une décision séparée,
inventaire des références et sauvegarde approuvée.

## 8. État des quinze points demandés

1. Fonctionnalité implémentée : inspection et proposition uniquement.
2. Contributions membres : BLOQUÉES à l’accord sur la persistance.
3. Texte : NON IMPLÉMENTÉ pour cette campagne.
4. Vidéo : infrastructure existante PARTIELLEMENT RÉUTILISABLE ; nouveau flux non implémenté.
5. Profil : système existant conservé ; liaison campagne NON IMPLÉMENTÉE.
6. Modération : outils existants réutilisables ; cycle campagne NON IMPLÉMENTÉ.
7. Feed public : NON IMPLÉMENTÉ.
8. Engagement/classement : primitives existantes ; campagne NON IMPLÉMENTÉE.
9. Identité Thanks the World : aperçu précédent conservé, pas présenté comme fonctionnel.
10. Animations Our Vision : inchangées pendant ce point d’arrêt.
11. Fichiers applicatifs modifiés : aucun. Ce document est une proposition.
12. Base : sept nouvelles tables proposées, aucune migration générée/appliquée.
13. Vérifications : lecture ciblée des schémas, actions, accès média, modération
    et composants existants ; pas de test fonctionnel d’un flux non construit,
    pas de requête en production, pas de démarrage/redémarrage de service.
14. Manquant : tout le nouveau flux persistant, son UI et ses tests ; améliorations
    visuelles à effectuer après franchissement de ce point d’approbation.
15. Prochaine étape exacte : accord explicite sur ce schéma et ces règles pour
    le développement uniquement, puis génération/revue de la migration avant
    application contrôlée. Aucun accord de production ou de déploiement implicite.
