# TOMI — Introduction d'accueil et THE ONE UNIVERSE

## Périmètre

Amélioration frontend de deux zones de l'accueil existant : introduction et
présentation des dix-sept secteurs. Aucun remplacement de la page complète.
Les autres pages, vidéos, animations existantes, programmes, navigation, accès
membre/Founder, CMS News et partenaires sont préservés.

## 1. Éléments existants réutilisés

- `pages/home/HomeExperience.tsx`, réexporté par l'entrée Home.
- `components/home/CinematicHero.tsx` et sa composition existante.
- Portraits `globe-bearer-360.webp` / `globe-bearer-479.webp` : femme originale,
  visage et tenue noire et or inchangés.
- Décor fourni `desert-dubai-640.webp` / `desert-dubai-1024.webp`, avec Burj Khalifa.
- Image officielle `flag-dubai-640.webp` et logo `tomi-official-logo.png` inchangé.
- Registre canonique `SECTORS` et fonction existante `sectorDestination()`.
- Typographie, couleurs, `SectionHeading`, `Reveal`, liens et architecture existants.
- Les reels, atlas, carrousel d'archives et autres sections restent en place.

Les deux vidéos principales existantes ont été examinées par métadonnées et
planches de photogrammes : entretien du Founder (75,7 s) et montage d'archives
(51,1 s). Aucun nouveau téléchargement vidéo n'a été ajouté à l'introduction.
Ces contenus ne sont pas présentés comme un plan de la femme marchant vers le globe.

## 2. Fichiers modifiés ou créés

Modifiés :

```text
artifacts/web/src/components/home/CinematicHero.tsx
artifacts/web/src/components/home/cinematic-hero.css
artifacts/web/src/pages/home/HomeExperience.tsx
artifacts/web/test/cinematic-hero.test.mjs
.agents/memory/homepage-reveal-principle.md
```

Créés :

```text
artifacts/web/src/components/home/OneUniverse.tsx
artifacts/web/src/components/home/one-universe.css
artifacts/web/test/home-one-universe.test.mjs
docs/HOMEPAGE-INTRO-UNIVERSE-REVIEW.md
```

Le composant partagé `TomiConstellation`, le registre des secteurs, les routes et
les composants des autres pages ne sont pas modifiés. Seul l'ancien appel de la
constellation sur Home est remplacé par le nouveau composant réservé à Home.

## 3. Introduction

Séquence visuelle nominale de **9,6 secondes**, organisée autour des fenêtres demandées :

| Temps | Réalisation possible avec les éléments existants |
| --- | --- |
| 0–3 s | Profondeur du décor, translation très légère de la photographie entière. |
| 3–5 s | Illumination dorée et connexions orbitales discrètes autour du globe. |
| 5–8 s | Apparition du logo officiel, du titre et de « We Are One / For Peace & Unity ». |
| 8–10 s | Stabilisation des boutons et du visuel du drapeau. |

Il s'agit d'une composition photographique animée, **pas d'un personnage 3D ou
d'une vidéo montrant une marche**. Aucun visage, vêtement ou logo n'est généré,
déformé ou redessiné.

- Les deux actions `/join` et `/ecosystem` existent et fonctionnent dès le début.
- « Skip intro » est immédiatement accessible au clavier et au toucher.
- Passer ou terminer la séquence affiche directement l'état stable, sans relancer
  les anciennes animations d'entrée.
- Le bouton Pause existant suspend aussi la séquence et les connexions lumineuses.
- Pas d'overlay bloquant, de verrouillage du défilement ou d'attente de vidéo.
- Une seule introduction par session d'onglet ; secours en mémoire si le stockage
  de session est bloqué, pour ne pas rejouer lors des navigations internes.
- La préférence de réduction du mouvement donne immédiatement la version statique
  et compte également comme une introduction déjà vue.

## 4. Globe et interactions

SVG léger représentant une sphère, méridiens, orbites et connexions. Aucun moteur
3D ni bibliothèque d'animation supplémentaire.

- Dix-sept indicateurs numérotés, chacun sélectionnable par clic ou toucher.
- Sélection dorée, numéro central et panneau nom/descriptions issus du registre.
- Bouton Explore vers la destination existante du secteur.
- Flèches clavier avec passage du premier au dernier secteur et inversement.
- Liste ordonnée lisible de dix-sept boutons avec noms et descripteurs :
  alternative complète à la représentation visuelle, utilisable sans survol.
- État sélectionné annoncé et panneau actualisé via une région `aria-live`.
- Animation de la sphère suspendue hors de la zone visible et supprimée en mode
  de réduction du mouvement.

Ce globe illustre l'appartenance à un écosystème : il ne représente pas des membres
géolocalisés, une activité en temps réel ou de nouvelles implantations.

## 5. Numérotation et destinations

| Nº | Nom officiel | Destination existante |
| --- | --- | --- |
| 01 | Fashion | `/ecosystem?sector=fashion#explore` |
| 02 | Music | `/ecosystem?sector=music#explore` |
| 03 | Dance | `/ecosystem?sector=dance#explore` |
| 04 | Film | `/ecosystem?sector=film#explore` |
| 05 | Art | `/ecosystem?sector=art#explore` |
| 06 | Business | `/ecosystem?sector=business#explore` |
| 07 | Investment | `/ecosystem?sector=investment#explore` |
| 08 | Tourism | `/ecosystem?sector=tourism#explore` |
| 09 | Diplomacy | `/ecosystem?sector=diplomacy#explore` |
| 10 | Innovation | `/ecosystem?sector=innovation#explore` |
| 11 | Technology | `/ecosystem?sector=technology#explore` |
| 12 | NGOs | `/ecosystem?sector=ngos#explore` |
| 13 | Media | `/ecosystem?sector=media#explore` |
| 14 | Education | `/ecosystem?sector=education#explore` |
| 15 | Real Estate | `/ecosystem?sector=real-estate#explore` |
| 16 | Health & Care | `/ecosystem?sector=health-care#explore` |
| 17 | Humanitarian Action | `/ecosystem?sector=humanitarian-action#explore` |

Aucun secteur, identifiant, nom ou parcours d'adhésion nouveau.

## 6. Adaptations d'affichage

- Desktop : composition photographique existante et globe/panneau côte à côte.
- Tablette : globe et panneau empilés, liste en deux colonnes selon la largeur.
- Mobile : composition photographique empilée sans déformation, indicateurs
  numérotés simplifiés et liste de grands boutons en une colonne.
- Les noms des secteurs restent disponibles dans la liste sans dépendre du survol.
- Réduction du mouvement : contenu statique conservant toutes les actions.
- Un correctif CSS réservé à Home, sous 360 pixels, réduit de 28 à 24 pixels
  l'entrée horizontale du reel existant tant qu'il est invisible. Son décalage
  initial créait un débordement de quatre pixels à 320 pixels. Le contenu, la
  vidéo, le composant partagé Reveal et l'état visible ne changent pas ; aucun
  masquage global du débordement n'est ajouté.

## 7. Performance

- Aucun nouveau fichier vidéo, service, dépendance ou téléchargement bloquant.
- Réutilisation des variantes WebP déjà optimisées et du petit logo officiel.
- Dimensions réservées aux images et globe à ratio fixe.
- Transitions d'opacité et de transformation ; orbites SVG discrètes.
- Pas de boucle JavaScript d'animation, de WebGL ou de suivi permanent de souris.
- Le fonctionnement des liens ne dépend jamais de la réussite du chargement média.
- Les vidéos hors de la zone autorisée et leur mode de chargement existant sont conservés.

La compilation conserve un avertissement de taille sur le bundle global existant
(environ 2,13 Mo minifié, 596 Ko gzip) et un avertissement sourcemap dans le tooltip
existant. Ce travail local ne prétend pas résoudre le chargement initial de
l'ensemble du site. Aucun score de performance sur appareil réel n'est annoncé.

## 8. Vérifications

### Contrôles hors ligne réussis

- Onze tests ciblés introduction/univers : identité et médias existants, liens,
  réduction du mouvement, Pause, Skip, stockage bloqué, non-répétition,
  numérotation exacte, dix-sept destinations, sélection directe et clavier.
- Vérification TypeScript frontend.
- Compilation Vite frontend avec `PORT=22333 BASE_PATH=/` pour reproduire les
  valeurs nécessaires au chargement de la configuration du service.
- Vérification des modifications : aucune modification de backend, base, Stripe,
  Clerk, permissions, Founder Workspace, News CMS ou partenaires.

### Contrôle élargi et limites préexistantes

L'exécution directe `node --test artifacts/web/test/*.test.mjs` donne 105 réussites
sur 107. Deux échecs sont extérieurs aux composants modifiés :

1. Le test Fashion importe du TypeScript partagé sans résolution d'extension
   compatible avec Node natif. Relancé avec le CLI `tsx` déjà installé :
   **les cinq tests Fashion réussissent**.
2. Un ancien test du Founder Workspace attend sept outils, alors que le module
   News précédemment autorisé en fournit désormais huit. Le test et le Workspace
   sont laissés intacts, conformément au périmètre de ce travail.

### Contrôle navigateur

Un parcours navigateur public a été exécuté sans connexion, soumission de
formulaire, écriture en base ou modification d'identité :

- Début de séquence en mode `play`, puis `done` au contrôle après environ dix
  secondes ; titre et actions restent visibles après la transition.
- Chargement réel du décor, du portrait, du globe, du logo et du drapeau.
- Navigation Join vers `/join`, retour arrière sans répétition de l'introduction.
- Skip dans un contexte neuf : état stable immédiatement et disparition de Skip.
- Les dix-sept secteurs sélectionnés en ordre officiel, chacun avec son numéro,
  nom, descripteur et destination corrects.
- Dix-sept indicateurs et dix-sept boutons lisibles ; bouclage clavier vérifié.
- Navigation effective vers Real Estate : l'explorateur existant sélectionne
  bien Real Estate, secteur 15.
- À 390 × 844 : liste tactile lisible, sélection du secteur 17 et bonne destination ;
  portrait et globe visibles sans déformation dans la composition mobile empilée.
- Contexte neuf avec réduction du mouvement : état stable initial, pas de Skip,
  aucune animation active dans le hero ou le globe.
- Aucun nouveau média 404 ou erreur de page observé ; avertissements existants
  de clés Clerk de développement/préchargement et de fournisseur WebGPU.

Le premier passage a détecté quatre pixels de débordement à 320 × 844. Le
diagnostic l'a isolé à l'ancienne entrée `translateX(28px)` du reel hors écran,
pas au hero ou au globe. Le correctif CSS limité au décalage de ce reel invisible
a été validé dans le navigateur par une règle temporaire : largeur document
ramenée de 324 à 320 pixels. La même valeur de 24 pixels est intégrée au CSS
de Home, uniquement sous 360 pixels et avant `is-visible`. Quand le reel devient
visible, sa transformation d'origine revient naturellement à zéro.

Les images du contrôle navigateur montrent le hero terminé sur desktop,
le globe et son panneau, le hero mobile, la femme et son globe ainsi que le
secteur 17. Il ne s'agit pas d'une certification d'accessibilité par lecteur
d'écran réel, ni de tests sur tous les appareils iOS/Android.

## 9. Sources manquantes

Pour obtenir les mouvements réalistes décrits dans le scénario, il manque :

1. Un plan source approuvé montrant **la même femme**, avec le même visage et
   la tenue noire et or originale, se dirigeant naturellement vers le globe.
   Idéalement, séquence d'environ dix secondes, versions paysage et mobile,
   MP4/WebM, poster et fond propre permettant l'intégration au décor.
2. Des plans approuvés de tissu en mouvement : drapeau TOMI et drapeaux nationaux
   internationaux. L'image actuelle montre le drapeau officiel TOMI ; une
   procession de drapeaux nationaux animés n'est pas inventée à partir de ce fichier.
3. Si un fond filmé plutôt que l'illustration fournie est souhaité : un plan
   de Dubaï/Burj Khalifa compatible en cadrage et lumière.

Le raccord Goma/Nyiragongo reste une extension antérieure facultative sans image
approuvée raccordée. Aucun volcan n'est fabriqué ou présenté comme une preuve.

## 10. Limites et arrêt

La photographie ne marche pas, ne change pas d'expression et ne fait pas onduler
des drapeaux inexistants. La profondeur et la lumière sont des effets de
composition ; la sphère des secteurs est une représentation SVG, pas un globe
photographique ou une carte géographique des utilisateurs.

Les nouveaux textes de contrôle suivent actuellement le contenu anglais de
l'accueil ; une localisation complète des nouveaux libellés n'est pas affirmée.

Aucune migration, modification de production, opération Stripe ou publication.
Seul le workflow frontend existant a été redémarré pour charger les modifications.
L'API et les autres services n'ont pas été démarrés ou redémarrés par cette intervention.
Arrêt après ces deux zones de Home ; aucune autre section n'est engagée sans
nouvel accord du Founder.
