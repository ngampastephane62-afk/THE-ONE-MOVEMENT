# TOMI — introduction cinématographique, phase 1

## Implémenté

Le premier hero remplace uniquement l'ouverture active de l'accueil. Le composant
précédent reste disponible ; la navigation, les routes et le contenu suivant sont
conservés. Aucun écran d'attente ni animation obligatoire ne bloque l'accès.

Le fond fourni associe désert, Dubaï/Burj Khalifa et motifs verts et dorés.
La photographie originale de la femme au globe est placée au premier plan,
avec des bords de photographie adoucis, sans détourage génératif, modification du
visage, de la peau ou du vêtement. La personne reste immobile. Un petit visuel
du drapeau complète l'identité. Textes : THE ONE MOVEMENT INTERNATIONAL,
WE ARE ONE, FOR PEACE & UNITY. Les actions pointent vers `/ecosystem` et `/join`.

Une lumière de braise symbolique s'efface vers l'or du désert en neuf secondes,
sans représenter une éruption. La mention « Eastern DR Congo · Goma → Dubai »
explicite la connexion. Le bouton principal est **Join the Movement**, suivi
d'**Explore the Ecosystem** en secondaire.

Seuls le fond et des lumières décoratives bougent lentement. Une commande permet
de suspendre/reprendre cette ambiance ; la préférence de mouvement réduit est
respectée. Aucun nouvel outil, appel IA, moteur 3D ou service n'est installé.
Les identifiants de futures scènes ne constituent pas une séquence implémentée.

## Visuels officiels utilisés

Originaux dans `attached_assets/`, laissés intacts :

- `7DF36A9A-0BF4-4850-B546-58A0EB6F4BA3_1792394467207.png` :
  illustration de fond fournie par le Founder, pas une photographie documentaire.
- `CB1296BD-462B-4A38-A86E-2F987E156A37_1792393925322.png` :
  femme portant le globe doré.
- `FB92CB54-5C43-4CAE-93C2-58C03DB0E673_1792393925322.jpeg` :
  drapeau TOMI devant Dubaï.

Les portraits du Founder en tenue léopard et du mannequin de défilé sont disponibles
mais volontairement non ajoutés pour ne pas surcharger cette première scène.
Les logos existants de la navigation ne sont pas modifiés.

Copies WebP redimensionnées sans retouche de contenu, environ 336 Ko au total
pour toutes les variantes installées, pas pour chaque chargement. Le navigateur
choisit ses variantes selon taille et densité d'écran :

- `desert-dubai-1024.webp` et `desert-dubai-640.webp`
- `globe-bearer-479.webp` et `globe-bearer-360.webp`
- `flag-dubai-640.webp` ; une variante `flag-dubai-1024.webp` est disponible
  mais n'est pas chargée par ce hero.

Ces fichiers se trouvent dans `artifacts/web/public/media/tomi-intro/`.

## Adaptation mobile

Sur téléphone : composition verticale, actions pleine largeur, photographie avec
visage, mains et globe visibles, fond conservé. Le personnage vient après les
textes : un défilement est nécessaire sur les petits écrans. Zoom d'ambiance,
grain et halos sont désactivés. Les images ne sont pas déformées.
Sur tablette : placement adapté du personnage et du fond.

## Actifs manquants ou limites

- Le dossier demandé ne contenait initialement qu'un fichier `flag` de zéro octet,
  inutilisable et non référencé.
- Le nouvel envoi fournit désormais le désert et la skyline sous forme
  d'illustration. Aucun panorama photographique indépendant ni skyline détourée
  n'a été fourni.
- Le fond mesure 1024 × 683 : un master de plus haute résolution améliorerait
  la netteté sur grand écran.
- L'origine Kuba des motifs n'est pas établie indépendamment : le site utilise
  les motifs fournis, sans certifier leur provenance.
- **Il manque un asset volcan / Goma distinct.** Les fichiers Summit/Goma
  identifiés sont des archives de rencontre, pas des paysages volcaniques.
  Le composant accepte un futur `originAsset` local avec description et dimensions,
  pour une transition d'origine vers le désert. Sans cet actif, aucune image
  de volcan n'est affichée ni demandée. L'emplacement est prêt, la scène n'est
  pas prétendue réalisée. Pas encore d'actifs dédiés aux cavaliers ou transition
  globe ; la séquence complète attend l'accord du Founder.

## Fichiers créés ou modifiés

Créés :

- `artifacts/web/src/components/home/CinematicHero.tsx`
- `artifacts/web/src/components/home/cinematic-hero.css`
- Les six fichiers WebP listés ci-dessus.
- `artifacts/web/test/cinematic-hero.test.mjs`
- `docs/CINEMATIC-HERO-PHASE-1.md`

Modifiés :

- `artifacts/web/src/pages/home/HomeExperience.tsx` : import et invocation du hero.
- `.agents/memory/homepage-reveal-principle.md` : actualisation de la direction
  autorisée par le Founder.

## Testé en isolation et contrôles statiques

- **98 tests frontend réussis**, dont cinq nouveaux : contenu/liens/images sous
  un chemin de base imbriqué, pause/reprise, préférence de mouvement et nettoyage
  de l'écouteur, maintien des sections et absence de clients backend dans le hero,
  absence de faux volcan et emplacement optionnel d'un actif local futur.
- TypeScript réussi.
- Compilation Vite réussie. Avertissements existants : sourcemap du tooltip et
  bundle principal volumineux ; ils ne sont pas masqués ni traités hors périmètre.
- Vérification des différences sans erreur d'espacement.
- Seul le workflow web a été redémarré et confirmé en fonctionnement.
- Captures de la composition à 1440 × 960 et 390 × 1500, puis de la dernière
  version Goma→Dubaï à 834 × 1112 : composition visible,
  photographie et globe préservés, actions lisibles, aucune erreur de rendu
  signalée. L'avertissement Clerk relatif aux clés de développement reste présent.
- Le contenu de l'accueil après le hero est identique octet pour octet à la
  version précédente, confirmé par comparaison.

## Non vérifié dans un navigateur

Les tests d'interaction sont isolés : pas de clic réel sur pause ou sur les liens,
pas de test clavier complet, ni session connectée. Safari/iPhone et Android réels,
leurs différentes densités d'écran et leurs moteurs de masquage CSS restent
à vérifier. Une capture à largeur mobile n'est pas une certification d'appareil.

Aucun backend, base de données, authentification, permission, abonnement,
paiement ou logique métier n'a été modifié. Aucun serveur backend redémarré,
aucune migration, aucun déploiement. La suite cinématographique attend
l'approbation du Founder.
