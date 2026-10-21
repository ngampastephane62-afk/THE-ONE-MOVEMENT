# Our Vision et activation Thanks the World — développement

## Périmètre autorisé

Affinage des deux pages existantes et activation de la seule campagne globale,
avec les deux images et la référence vidéo fournies dans l'addendum.
Pas de reconstruction du site, de modification de l'accueil ou du film Goma,
de changement de fournisseur d'identité, de droits d'adhésion ou de paiements.
Aucune migration et aucun déploiement.

## Activation réelle

La base de développement a été sélectionnée par l'outil de base de données puis
comparée au serveur utilisé par la commande de maintenance, sans lire ni afficher
de chaîne de connexion.

La commande `artifacts/api-server/scripts/activate-thanks-world-development.mjs`
exige une approbation explicite de développement, l'empreinte indépendante de la
base et un membre fondateur déjà enregistré et non suspendu.
Elle n'est appelée ni au démarrage de l'API ni lors d'une publication.

Elle utilise **le service existant `gratitudeAction`**, avec ses validations,
son contrôle fondateur et son audit, dans une transaction verrouillée.
Ce contexte de maintenance autorisé n'est pas une session Clerk usurpée.
Aucun compte, rôle, abonnement ou paramètre d'authentification n'est modifié.

Résultat vérifié par lecture indépendante et par `/api/gratitude/options` :

- Une campagne officielle, sans doublon.
- Slug : `thanks-the-world`.
- Nom : `THANKS THE WORLD`.
- État : `active`.
- Identité : `global`, aucune campagne parente.
- Description : « Share your gratitude with the world. Celebrate your country,
  community, culture and the people who inspire you. »
- Audit : `gratitude.campaign.save` attribué au fondateur existant.
- Une deuxième exécution ne modifie rien et ne crée pas de doublon.

Le titre éditorial reste dans l'interface existante : « EVERY COUNTRY HAS A
STORY. EVERY VOICE MATTERS. » Aucune nouvelle colonne n'est nécessaire.
L'activation n'autorise pas la publication automatique des contributions.

## Visuels et référence réellement examinés

- Our Vision : première image fournie, dérivé
  `public/images/vision/founder-world-earth.webp` (environ 197 Ko).
- Thanks the World : seconde image fournie, dérivé
  `public/images/vision/founder-world-gold.webp` (environ 79 Ko).
- Référence vidéo MOV de 15 secondes : huit instants examinés visuellement.
  Principes observés : sujet qui se déplace horizontalement, anneau derrière le
  sujet, composition qui se décale et grandes lignes typographiques successives.
- Adaptation TOMI originale : ces mouvements sont appliqués aux cartes fournies,
  sans statue, marque ni écran promotionnel du musée.
- La carte générique initialement préparée a été supprimée.

## Mouvement et lisibilité

Surfaces isolées : fond 0, décoration 1, voile de lecture 2, contenu 3.
Décoration et descendants ignorent les clics et sont masqués des lecteurs
d'écran. Petits points non lumineux, lignes discrètes et drapeaux peu opaques.

Séquence Our Vision : carte 0–2 s ; connexions et déplacement 2–4 s ;
« ONE WORLD. » à 4 s, « ONE HUMANITY. » à 4,6 s ;
« ONE SHARED FUTURE. » à 6 s, puis état final.
Il n'y a pas d'écran de chargement bloquant.

Les révélations sont une amélioration visuelle : sans animation la copie reste
visible ; le mouvement réduit affiche l'état final. Les sections comportant des
animations continues sont mises en pause hors écran et dans un onglet masqué.
Les titres de sections alternent leurs directions et les six domaines de
connexion conservent leur navigation au clavier.

## Boutons et session membre

- SHARE YOUR STORY : éditeur avec intention texte.
- UPLOAD YOUR VIDEO : éditeur avec intention vidéo ; un titre et un brouillon
  enregistré sont nécessaires avant de réserver l'envoi privé.
- EXPLORE STORIES : ancre du véritable fil modéré.

Une correction de navigation applicative conserve uniquement les intentions
`text` ou `video` pendant le retour de connexion. Ce n'est pas une modification
de Clerk : les fournisseurs et contrôles d'identité sont inchangés, et aucune
URL de retour arbitraire n'est acceptée. Les destinations existantes des
candidatures Fashion restent prioritaires et inchangées.

## Vérifications déjà réussies

- Typage web.
- Dix tests hors navigateur : pays et contrôles Vision, clavier, contexte Goma,
  repli visible, intentions et liste fermée des destinations de retour.
- Vingt-quatre assertions PostgreSQL avec annulation intégrale des données
  techniques : versions, soumission, approbation/rejet, fil, confidentialité,
  blocage, engagement et isolation des fichiers.
- API publique : campagne globale réellement active, 250 pays, huit thèmes.
- Aperçu Thanks the World en 390 × 844 : image fournie visible derrière le
  texte et trois boutons sans débordement.

Le passage navigateur coordonné complète les dix critères d'acceptation.
Les tests sur appareils iOS/Android physiques restent distincts de l'émulation
mobile du navigateur.

### Diagnostic du premier chargement membre

Une première capture immédiatement après connexion montrait un écran vide.
La reproduction avec écoute des erreurs et attente du chargement n'a relevé
aucune exception JavaScript, réponse HTTP en erreur ni requête échouée.
L'éditeur et la campagne sélectionnée apparaissent après établissement de la
session ; le message d'activation facultative du réseau ne bloque pas l'éditeur.
Il ne s'agissait pas d'un motif pour changer Clerk, les rôles ou l'adhésion.

### Résultats du passage membre

Le texte privé a été enregistré, rouvert après rechargement, puis soumis après
une modification du corps sans sauvegarde intermédiaire : la version la plus
récente se trouve bien en attente de revue.

Une contribution vidéo seule, avec titre, pays et thème mais corps vide, a
accepté un vrai fichier MP4 de test d'une seconde, traité à l'état `ready`,
puis a été soumise à la revue. Le fichier privé répond 200 au propriétaire
et 404 sans authentification. Aucun contenu technique n'a été publié.

Les deux contributions techniques, leurs références et les trois objets privés
correspondants ont été supprimés et leur absence vérifiée. La campagne globale
reste active, sans contribution publiée.

Limites explicites : le contexte navigateur a été perdu pendant ce passage.
Le contrôle fin des couches et du rythme, le retour exact de connexion, la
lecture vidéo dans l'aperçu, le parcours visuel d'un vrai fondateur et le fil
après approbation ne sont pas tous validés dans ce navigateur. Les preuves de
code et les tests PostgreSQL en transaction restent distincts de ces contrôles
visuels incomplets. Aucun nouvel utilisateur privilégié ni fausse publication
n'a été créé pour les contourner.
