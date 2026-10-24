# Audit ciblé TOMI avant corrections

## Périmètre et infrastructure réutilisée

- Six programmes : `pages/programs/detail.tsx` distribue les quatre pages dédiées
  Gala, Fashion Week, Awards, Summit et le gabarit `ProgrammeEditorialPage` pour
  Fashion Night et Investment Forum. Aucun changement de route nécessaire.
- Gala : `pages/programs/gala/{Hero,Vision,Pavilions,Experiences,Culture,Partnerships,Participants,Represent}.tsx`.
  Les expériences utilisaient un concept de pavillon, une réunion d'archives et
  la photo de performance culturelle ; les fichiers d'origine sont à conserver.
- Fashion Week : `pages/programs/fashion/{index,FashionArchive,DesignerPackages}.tsx`.
  Les composants `FashionConnections`, `PeaceVoices` et les offres de formation
  doivent être distingués du programme événementiel.
- Awards : CMS public `GET /api/program-editorial/awards`, huit identités de
  personnes trouvées. Ne pas supprimer une collection prétendument de cinq sans
  identification distincte. Les autres programmes renvoient aussi HTTP 200.
- Médias : `pages/media/index.tsx`, composants `media-center/` ; le CMS public est
  `GET /api/media-center`, pas `/api/media-publications`. Il renvoie zéro
  publication à ce stade, sans erreur. Les archives statiques restent distinctes.
- Partenaires : `pages/partners/index.tsx`, `PartnerOrbitStage`, `PartnerGallery`,
  `PartnerNetworkHero`, `DocumentaryTeasers`. Le répertoire public fonctionne :
  43 organisations à l'audit. Préserver toutes les photographies historiques et
  le temps d'affichage de trois secondes après chargement effectif.
- Humanitaire : route publique existante `/donate` et composants humanitaires.
  Les films et la galerie authentique sont à réutiliser ; pas de faux événements.
- Écosystème : pages existantes `pages/ecosystem`, `SectorExplorer`, données
  `lib/sectors-data.ts` et clé existante. Les dix-sept mondes ne sont pas des programmes.
- Animation : `SectionHeading`, `Reveal`, `components/programs/editorial/motion.tsx`,
  observer et styles éditoriaux existants. Harmoniser plutôt qu'ajouter une bibliothèque.
- Galeries : composants éditoriaux `GalleryActions`, archives Fashion Week et
  stage Partenaires existants ; conserver ratios, crédits et identités.
- Demandes : système institutionnel et demandes spécifiques aux programmes déjà
  présents ; aucune seconde infrastructure de formulaire ou d'enregistrement.

## Founder : conclusions structurelles

Les routes privées sont présentes dans `pages/member/index.tsx` et gardées par
`me.founder`. Les API correspondantes emploient `networkAuth` et `requireFounder`.
Les GET privés News, Partners, Programs et Media renvoient 401 sans session :
c'est un refus attendu, pas une panne à contourner.

Le Workspace ne proposait pas de raccourci aux onglets existants de modération
des membres suspendus et des campagnes de gratitude. Ces destinations existent
déjà dans Admin et sa liste d'onglets autorisés : ajouter des liens est une
correction de découvrabilité, sans nouveau droit ni modification serveur.

Les panneaux Pages, Branding, Publishing History global et Founder Settings
sont explicitement non implémentés. Les masquer comme « corrigés » serait faux.
L'historique de News reste distinct du futur historique global.
Le CMS de programmes gère déjà texte, hero, personnes, vidéos et annonces,
mais pas un catalogue complet d'archives photographiques par édition, année et
lieu. Une persistance complémentaire exige une approbation séparée.
La galerie historique Partenaires n'a pas encore d'éditeur complet de chaque
légende dans Workspace. Ne pas confondre l'éditeur de répertoire avec cet outil.

## Vérifications initiales et limites

- Six suites de contrats isolés API : 45 tests réussis
  (programmes, partenaires, médias, News, proxy Clerk et projections privées).
  Ce sont des tests avec fixtures, pas la preuve d'une publication en session réelle.
- Paiements magazine indisponibles en développement. Le blocage Stripe connu
  est une suspension de vérification du compte et l'absence de capacité carte ;
  pas de changement de compte, de transaction ou de déploiement autorisé ici.
- Aucun nouveau schéma, rôle, compte, fichier d'archive ni contenu CMS réel modifié
  par les diagnostics ci-dessus.
- La vérification navigateur finale devra distinguer les parcours publics, les
  fixtures interceptées et toute session privée réellement accessible.
