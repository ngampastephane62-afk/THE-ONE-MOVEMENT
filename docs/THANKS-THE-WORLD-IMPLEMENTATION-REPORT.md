# Thanks the World — compte rendu de développement

Ce document concerne uniquement le développement. Aucun déploiement n'est demandé
ou effectué. La migration déjà approuvée n'est pas rejouée. Les abonnements, Stripe,
Clerk, les droits d'adhésion et l'accueil restent hors périmètre.

## 1. Fonctionnalités

**WORKING** — module persistant distinct des annuaires `/thanks-world` et des
témoignages `/thanks-emirates` : brouillons, soumission consentie, contrôle
fondateur, découverte publique et interactions enregistrées.

## 2. Contributions membres

**WORKING** — espace `/member/thanks-the-world`, compte TOMI existant, campagne
active, pays, thème, aperçu, statut et archivage. Les versions empêchent un
enregistrement périmé de remplacer silencieusement un contenu plus récent.
Les modifications non enregistrées sont sauvées avant la soumission.
Un brouillon non soumis reste réservé à son auteur.

## 3. Texte

**WORKING** — texte seul, texte accompagné d'images, ou vidéo sans texte.
Huit thèmes, titre obligatoire à la soumission, pays recherché dans un jeu de
250 pays et territoires avec attribution ODbL. La géographie est dérivée du pays,
pas présentée comme une nationalité vérifiée.

## 4. Vidéo

**WORKING côté serveur** — MP4, MOV/QuickTime et WebM ; maximum 100 Mio et trois
minutes. Copie privée immuable avant inspection, validation réelle, transcodage
MP4/H.264/AAC, vignette JPEG, ressources et temps de traitement bornés.
Le navigateur propose progression, aperçu, annulation et reprise de la même
réservation. Les images sont réencodées ; maximum 10 Mio, trois images ou une
vidéo, sans mélange.

**NOT IMPLEMENTED** — enregistrement par caméra intégrée au site. Le texte de
l'interface l'indique. Les essais sur appareils iOS/Android physiques restent à
distinguer d'un navigateur de test.

## 5. Profils

**WORKING** — contributions approuvées rattachées au compte et à son profil
public selon `isPublic`, `publicMedia` et la suspension. Changer la confidentialité
révoque la lecture publique côté serveur, y compris sur les URL des dérivés.
L'activation du réseau social n'est pas une condition supplémentaire d'adhésion.

## 6. Modération

**WORKING** — onglet intégré au Founder Workspace existant ; consultation des
contributions soumises et de leurs médias, publication, rejet avec corrections,
mise en avant, masquage, restauration, modération des réponses, résolution des
signalements. Autorisation fondateur existante, motifs et audit transactionnel ;
aucune auto-approbation, aucun nouveau compte fondateur.

## 7. Fil public

**WORKING** — `/thanks-the-world` : pays, continent, campagne, récent, vues,
likes, discussions et mise en avant ; pagination et états vide/erreur.
Seules des versions approuvées d'une campagne active sont exposées.
Les campagnes ne sont pas activées ni alimentées artificiellement.

## 8. Engagement et classements

**WORKING** — vues, likes, réponses et actions de partage issus de PostgreSQL ;
unicité par membre pour les indicateurs dédupliqués, exclusion de l'auto-engagement,
limites partagées et bornées en base, filtrage des suspensions et blocages.
Une action de partage n'est pas présentée comme une livraison vérifiée sur un
réseau externe. Compteurs également visibles dans la revue fondateur.

**NOT IMPLEMENTED** — déclaration de gagnants, règles d'attribution de prix,
prédiction de fraude ou garantie d'identité humaine de chaque compte.

## 9. Identité Thanks the World

**WORKING** — titre, slogan et message international demandés ; liens réellement
reliés à la découverte et à la contribution ; drapeaux locaux discrets et
typographie cinématique. Les cinq familles visuelles sont distinctes et
présentées comme des traitements originaux, pas comme des symboles historiques.
Gestion d'une campagne parente depuis l'espace fondateur.

**PARTIALLY IMPLEMENTED** — pas de photothèque culturelle régionale complète ni
d'éditeur de médias de campagne personnalisé.

## 10. Our Vision

**WORKING** — entrée du texte, transitions de sections, profondeur, connexions
et drapeaux internationaux discrets. Contenu lisible avant animation et
préférence de mouvement réduit respectée.
Le film Goma, sa légende, son crédit et son contexte historique sont conservés.

**BLOCKED** — la référence vidéo « Museum of Art » n'a pas été retrouvée dans les
pièces accessibles ; les animations sont originales, pas une reproduction validée
de cette vidéo.

## 11. Principaux fichiers

- `lib/api-spec/openapi.yaml` et clients/validateurs générés dans
  `lib/api-client-react` et `lib/api-zod`.
- `lib/shared/src/gratitude.ts`, jeu de pays et licence ; export partagé.
- `artifacts/api-server/src/routes/gratitude.ts`, enregistrement du routeur.
- `artifacts/api-server/src/services/gratitude{Actions,Read,Store,Policy,Uploads,Video}.ts`.
- Isolation des médias dans `services/networkFiles.ts` et `routes/network.ts`.
- Garde-fous purs dans `services/mediaIsolation.ts`, sans dépendance à
  l'authentification ni au stockage dans les tests isolés existants.
- `artifacts/web/src/pages/thanks-the-world/`, `pages/member/ThanksTheWorld.tsx`.
- `artifacts/web/src/components/gratitude/`, `src/lib/gratitude.tsx`,
  `public/flags/` (250 miniatures de drapeaux).
- Intégration aux routes, navigation membre/fondateur et profil public existants.
- `artifacts/web/src/pages/our-vision/{index.tsx,ThanksWorldLive.tsx,vision.css}`.
- Tests et ce rapport ; aucun remplacement de l'accueil.

## 12. Base de données

**WORKING** — les sept tables approuvées ont été migrées précédemment et vérifiées.
Aucune nouvelle migration, aucun `push`, aucune modification de production dans
cette phase. Proposition et revue SQL disponibles dans
`THANKS-THE-WORLD-APPROVAL-PROPOSAL.md` et `THANKS-THE-WORLD-MIGRATION-REVIEW.md`.

## 13. Vérifications

- Typage API et web : réussi.
- Génération du client et validation des bibliothèques partagées : réussies.
- 24 assertions d'intégration PostgreSQL : réussies, fixtures intégralement
  annulées par transaction (confidentialité, versions, consentement, modération,
  compteurs, blocage, signalements, retrait, protection contre la réutilisation
  d'un média privé dans un autre canal).
- Six tests de traitement natif : MP4, MOV, WebM, image JPEG dérivée, fichier
  illisible et dépassement de durée.
- 19 tests de pays, Vision et migration : réussis après adaptation du lien de
  découverte à la nouvelle page fonctionnelle.
- 46 tests de non-régression News, publications ordinaires, confidentialité et
  démarrage sécurisé : réussis, après mise à jour des doubles de test pour la
  nouvelle isolation des médias.
- API en fonctionnement : options et fil public 200 ; ressources privées 401
  sans connexion. 250 pays, huit thèmes, aucune campagne officielle activée.
- Aperçu mobile 390 px : page visible, boutons et hiérarchie lisibles.
- Passage unique dans le navigateur : brouillon conservé après rechargement,
  modification sauvée avant soumission, vidéo seule réellement envoyée et
  traitée avec vignette et contrôles natifs, état `pending_review`, média lisible
  par l'auteur (200) et introuvable anonymement (404), espace fondateur refusé au
  membre ordinaire (403), confirmation avant abandon de changements.
  Aucune activation du réseau social ni approbation de contribution de test.
- La campagne technique temporaire, ses deux contributions privées, les
  références de médias, fenêtres de limitation, trois registres d'envoi et leurs
  trois objets privés ont été supprimés et leur absence vérifiée. Les traces
  d'audit n'ont pas été effacées ; le compte technique demeure pour traçabilité.
- Limites du passage navigateur : pas d'écoute audio ni de mesure de lecture
  vidéo ; la tentative HTTP directe de modération a été bloquée par le contrôle
  d'origine avant d'atteindre le contrôle de rôle. Ce dernier est testé dans les
  assertions d'intégration, sans usurper un compte fondateur réel.

## 14. Limites connues

Les traitements vidéo sont synchrones et bornés à un par instance : une autre
demande reçoit une erreur réessayable, pas une fausse réussite.
Une file durable et un nettoyage planifié des fichiers orphelins demanderaient
un chantier complémentaire, avec approbation préalable de tout nouveau schéma.
Pas d'enregistrement caméra, d'auto-sous-titrage ni de règles de prix inventées.
La traduction exhaustive des nouvelles interfaces n'est pas incluse ici.

## 15. Prochaine étape exacte

Après les vérifications, le Founder crée ou choisit une campagne officielle et
l'active depuis son espace existant, puis examine une véritable contribution
soumise avant sa publication. Aucun nouveau grand module ni déploiement sans son
accord. Fournir la référence Museum of Art si une correspondance visuelle exacte
est souhaitée.
