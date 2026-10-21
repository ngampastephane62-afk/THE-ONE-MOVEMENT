# Founder Workspace — Phase A

## Livraison

Route privée : `/member/founder`, à l'intérieur de l'espace membre existant.
L'entrée **Founder Workspace** est réservée au Founder :

- lien dans la navigation latérale sur ordinateur ;
- carte de navigation en haut du contenu sur mobile, sans élargir la barre
  inférieure des membres.

Le Workspace reprend les couleurs, typographies et composants de TOMI. Il présente
un accueil, neuf sections avec état actif, sept accès aux outils existants et
les limites des prochains modules. Il n'affiche aucune statistique inventée.
Des liens permettent de revenir à l'espace membre et au site public.

## Outils raccordés

| Outil existant | Destination |
|---|---|
| Archive de couverture presse | `/member/admin?tab=news` |
| Demandes médias | `/member/admin?tab=media` |
| Introductions partenaires | `/member/admin?tab=intros` |
| Certifications | `/member/admin?tab=certs` |
| Signalements et modération | `/member/admin?tab=reports` |
| Offres humanitaires | `/member/admin?tab=offers` |
| Revue des propositions magazine | `/tropik-magazine/contribute#founder-review` |

`/member/admin` est conservé. Ses onglets acceptent désormais un paramètre `tab`
limité aux identifiants existants ; une valeur inconnue ouvre Certifications.
Les boutons changent l'URL, donc les liens directs et le retour navigateur restent
cohérents. Un lien ramène au Workspace. Aucun formulaire métier n'est dupliqué.

## États honnêtes

- **Overview** : fondation et outils disponibles.
- **Pages** : Not yet available.
- **News & Articles** : archive presse et revue magazine disponibles ; éditeur
  complet des articles indisponible.
- **Partners** : introductions disponibles ; édition des partenaires, logos et
  dates indisponible.
- **Media Library** : indisponible ; les demandes médias sont présentées comme un
  outil distinct, pas comme une médiathèque.
- **Programs & Events**, **Branding**, **Publishing History**, **Founder Settings** :
  indisponibles, sans faux boutons d'édition ou d'enregistrement.

La sélection des sections est locale : une actualisation revient à Overview.
La navigation prend en charge clic, flèches, Home et End, avec focus visible
et contrôle sélectionné. Les transitions respectent le mouvement réduit.
Les principaux contrôles du nouveau Workspace ont une hauteur minimale de 44 px.

## Sécurité

- Session Clerk et statut Founder existants réutilisés, sans second rôle.
- Le parent `NetworkGate` conserve les états de chargement, d'erreur et de reprise.
- La route vérifie `me.founder` fourni par l'API existante.
- Le composant vérifie aussi ce statut avant de rendre son contenu.
- Un membre ordinaire est redirigé vers `/member` ; le visiteur suit la redirection
  existante vers la connexion.
- Aucun nouvel endpoint, appel API ou hook de mutation dans le Workspace.
- Seul le nom affiché est utilisé ; aucun email, secret, identifiant interne ou
  paramètre de configuration sensible n'est affiché.
- Les outils liés continuent à utiliser leurs contrôles Founder côté serveur.
  La route frontend n'est pas présentée comme une nouvelle barrière serveur :
  la protection des données et opérations reste celle des API existantes.
- Aucun changement à `TOMI_FOUNDER_EMAIL`, Clerk, aux permissions, au backend,
  au schéma, aux paiements ou aux règles d'adhésion.

## Fichiers

Créés :

- `artifacts/web/src/pages/member/FounderWorkspace.tsx`
- `artifacts/web/src/components/founder/founder-workspace-config.ts`
- `artifacts/web/src/lib/admin-navigation.ts`
- `artifacts/web/test/founder-workspace.test.mjs`
- `docs/FOUNDER-WORKSPACE-FOUNDATION.md`

Modifiés :

- `artifacts/web/src/pages/member/index.tsx`
- `artifacts/web/src/pages/member/Admin.tsx`
- `.agents/memory/project-control.md` : limite d'autorisation pour la suite.

Le fichier de consignes fourni n'est pas modifié. Aucun fichier backend,
contrat généré, page publique, secteur ou programme n'est modifié.

## Vérification

**Testé en isolation :**

- 105 tests frontend réussis, dont sept nouveaux pour ce périmètre.
- Refus du composant pour un membre ordinaire.
- Neuf sections, sept liens, état actif et navigation clavier.
- Sections futures sans formulaire factice.
- Nom affiché échappé et absence d'email dans le rendu.
- Sélection réelle de chaque onglet Admin par URL, valeurs inconnues refusées.
- Conservation des branches de chargement/erreur et des contrôles serveur dans
  les sources ; ces assertions ne remplacent pas un test d'autorisation HTTP.
- Aucun serveur, Clerk, stockage ou base n'est contacté par ces tests isolés.

**Contrôles statiques :** TypeScript, compilation Vite et vérification
d'espacement réussis. Avertissements existants conservés : sourcemap du tooltip
et taille du bundle principal. Aucune dépendance ajoutée.

**Observation navigateur limitée :** à largeur 390 px, l'ouverture sans session
de `/member/founder` aboutit à la page de connexion, sans contenu administratif
visible. Aucun parcours de connexion ou de publication n'a été exécuté.
Seul le workflow frontend a été redémarré et confirmé actif.

**Non vérifié à l'exécution :** rendu privé connecté sur ordinateur/mobile,
permissions HTTP avec de vraies sessions Founder et membre, et ouverture effective
des outils API. Le serveur backend n'a pas été démarré ou redémarré, conformément
aux consignes. Aucun accès aux données de production.

## Arrêt du périmètre

Phase A uniquement. Aucun CMS, historique éditorial, bibliothèque globale, nouveau
rôle, migration ou déploiement. L'édition de contenus et la phase B attendent
l'autorisation du Founder.
