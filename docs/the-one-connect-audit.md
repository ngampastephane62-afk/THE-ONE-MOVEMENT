# THE ONE CONNECT — audit et proposition

Date : 2026-11-09. Statut : audit, pas d’implémentation autorisée.
Sources : directive fournie, code du projet et métadonnées du schéma de
développement lues sans contenu de conversations, tarifs officiels ci-dessous.
Aucune donnée de production, identité, conversation ou pièce jointe consultée.
Aucun abonnement, migration, changement de code applicatif ou déploiement.

## 1. Existant réutilisable

- React/Vite, Clerk et les identifiants des membres restent en place.
- `artifacts/web/src/pages/member/Messages.tsx` : boîte de réception mobile,
  demandes accepter/refuser, messages texte, états envoyé/lu, non-lus,
  blocage et signalement. Les brouillons restent présents en cas d’échec.
- `lib/db/src/schema/network.ts` et schéma de développement : conversations
  à deux (`member_a`, `member_b`), paire unique ; messages avec identifiant,
  auteur, texte, indicateur lu et date. Aucun modèle de groupe actuellement.
- `ordinaryMessaging.ts` : transaction et verrous PostgreSQL pour les premiers
  contacts, cinq demandes/24 h glissantes, dix demandes sortantes en attente.
  Les échanges acceptés n’ont pas de quota quotidien commercial.
- `networkState.ts` / `networkActions.ts` : contrôle de participation,
  activation, suspension et blocage. Le statut Founder n’ouvre pas les chats
  d’autres personnes.
- `networkAuth.ts` : identité Clerk et contrôles d’écriture existants.
- `networkFiles.ts` : stockage privé, autorisation PUT temporaire,
  contrôle de taille, métadonnées et signature de fichier ; quotas existants.
- `routes/network.ts` : média authentifié, vérification de visibilité,
  plages HTTP pour lecture audio/vidéo, cache privé. Les pièces justificatives
  administratives ont un cas d’accès Founder distinct : ne pas l’appliquer
  aux futurs fichiers de conversation.
- `AdministrativeServiceInbox.tsx` et notifications Founder : canaux distincts
  à préserver ; ne pas y recopier les messages privés.

## 2. Écarts et risques

- Rafraîchissement du chat toutes les 15 s, pas de présence, frappe ni transport
  temps réel dédié trouvé. Aucun SDK Daily/LiveKit/Jitsi présent.
- L’API charge un état réseau large : 100 conversations, jusqu’à 5 000 messages,
  puis les 100 derniers du chat sélectionné. Sans pagination dédiée, un ancien
  chat peut être inaccessible et les compteurs tronqués. Ce n’est pas une
  preuve de suppression en base ; il faut rendre tout l’historique navigable.
- Pas de pièces jointes dans le modèle des messages ; Word/Excel/PowerPoint et
  les formats usuels de MediaRecorder ne sont pas tous autorisés aujourd’hui.
- Un accès aux fichiers fondé sur publication/profil ne constitue pas une
  autorisation de chat. Introduire un périmètre séparé et non réutilisable
  dans le Feed, News, les profils ou les justificatifs administratifs.
- Les contrôles de signature existants ne sont pas un antivirus.
  Aucun scanner antimalware dédié trouvé dans le parcours inspecté.
- La lecture est un booléen à deux personnes ; les groupes exigent des curseurs
  individuels. Les reçus ne doivent pas signifier « livré » avant confirmation.
- Aucun test réel à deux comptes ni vérification physique Safari effectués
  dans cet audit. Aucune promesse d’appel en arrière-plan ou de chiffrement
  de bout en bout.

## 3. Phase 1 proposée, après approbation

### 1A — conservation et fondations

Conserver les tables, identifiants et conversations actuels ; migrations
strictement additives. Ajouter un type direct/groupe et des participations
(rôle, invitation/acceptation, départ, lecture, silence, archive).
Pour les directs historiques, créer deux participations en reprenant
l’acceptation existante et sans notifier ni rouvrir les demandes refusées.
Conserver le booléen historique pendant la transition ; créer les curseurs
sans marquer les messages non lus comme lus.
Une nouvelle invitation de groupe n’ajoute pas une personne automatiquement.
Définir l’accès à l’historique avant/après adhésion et au départ du groupe
avant le SQL ; proposition : visibilité depuis l’acceptation, accès révoqué
au départ, sans suppression des messages des autres participants.

Créer des endpoints dédiés et paginés pour inbox/messages/recherche.
Garantir des compteurs SQL exacts et des clés d’envoi idempotentes.
Conserver anti-spam, blocage et refus ; aucun paiement ni appartenance à
un secteur exigé pour un échange ordinaire autorisé.

### 1B — expérience de conversation

- Cinq thèmes personnels persistants : Emerald & Gold, Midnight Luxury,
  Ivory Minimalist, Dark Professional et Original Classic. Contrastes vérifiés.
- Réponses, réactions, modification et suppression par l’auteur avec état
  explicite ; pas d’édition/suppression administrative générale du chat.
- Épingles, recherche dans le chat, silence, archive et préférences de notification.
- Groupes sur invitation ; hôte et membres avec droits contrôlés côté serveur.
- Présence facultative, masquée par défaut ; frappe éphémère uniquement dans
  un chat autorisé, sans journal de surveillance.
- Interface mobile, zones de sécurité et clavier ; libellés dans les sept
  langues du site. Ne pas traduire automatiquement les messages des membres.

Approche initiale peu coûteuse : requêtes différentielles dédiées,
adaptatives en premier plan, arrêtées lorsque la page est masquée,
avec fréquence et charge mesurées. Ne pas annoncer un temps réel instantané.
Les événements utiles sont durables en PostgreSQL ; frappe et présence
expirent rapidement. Un transport poussé ultérieur devra fonctionner entre
instances, pas via un bus mémoire local isolé.

### 1C — voix et fichiers privés

- Enregistrer par MediaRecorder seulement après permission ; arrêt, pause
  quand disponible, durée, annulation, aperçu et confirmation d’envoi.
- Détecter les codecs réellement pris en charge ; couvrir MP4/AAC et
  WebM/Opus selon navigateur, avec contrôles serveur adaptés. Tester
  la lecture croisée Safari/Chrome ; si une conversion est nécessaire,
  chiffrer et approuver le traitement avant de promettre la compatibilité.
- Pièces jointes : PDF, images, vidéos, audio et Office approuvé sans macros.
  Refuser exécutables, HTML actif, documents à macros et archives arbitraires.
  Examiner les conteneurs Office, limites de décompression et vrais types.
- Upload avec progression, état, reprise/retry, nom et taille ; ne finaliser
  qu’après validation. Mettre en quarantaine les fichiers qui nécessitent un
  scan ; ne pas proposer comme « sûrs » des fichiers non analysés.
- Téléchargement après vérification de participation et blocage ; lien signé
  de courte durée, jamais public. Expliquer qu’un lien déjà délivré peut
  rester valable jusqu’à expiration ; privilégier le proxy authentifié
  lorsque la révocation immédiate est nécessaire.
- Pas de récupération serveur automatique des URL fournies ; liens sûrs
  cliquables sans exécuter ni intégrer du contenu arbitraire.
- Conserver le plafond vidéo déjà autorisé de 500 MiB. Les quotas de documents,
  durée des notes vocales, rétention et purge nécessitent un choix explicite
  avant activation ; ne pas effacer les anciennes conversations.
- Notifications intégrées par défaut, sans contenu privé dans les surfaces
  publiques. Aucun email/push activé automatiquement.

## 4. Phases ultérieures séparées

**Phase 2 :** appels individuels audio/vidéo gérés, permissions, invitation,
acceptation/refus, durée, contrôle des appareils, reconnexion et appel manqué.
**Phase 3 :** réunions 2–10 personnes d’abord ; invitations privées révocables,
authentification plus participation avant émission de jeton court lié à la
salle/utilisateur/rôle ; salle d’attente, retrait et fin par hôte, partage
d’écran uniquement sur appareils compatibles, rappels opt-in.
Le Founder peut inviter dans les 17 secteurs, pas lire les chats privés.
Ne jamais autojoindre caméra/micro. Pas d’enregistrement par défaut.
**Phase 4 non incluse :** calendrier, enregistrement, transcription, résumés IA
et espaces d’équipes, à étudier uniquement sur nouvelle autorisation.

## 5. Comparaison et budget indicatif

Tarifs consultés le 2026-11-09, USD hors taxes, hors développement,
hébergement applicatif, base, stockage, emails et traitement de médias.
Les tarifs et conditions doivent être revérifiés avant toute souscription.
Les membres inscrits ne déterminent pas à eux seuls une facture d’appels.

Hypothèse d’appel : **60 minutes connectées par membre actif et par mois**.
Ainsi 100 / 1 000 / 10 000 membres = 6 000 / 60 000 / 600 000
minutes-participants. Un appel de 30 min à 10 personnes vaut 300 minutes.

| Solution | 100 actifs | 1 000 actifs | 10 000 actifs |
|---|---:|---:|---:|
| Daily vidéo, tarifs progressifs inclus | 0 $ | 200 $ | 2 180 $ |
| Daily audio seul, scénario alternatif | 0 $ | 49,50 $ | 542,10 $ |
| LiveKit Cloud vidéo, hypothèse réseau ci-dessous | 50 $ | 128 $ | 1 100 $ |

Daily : premières 10 000 minutes mensuelles gratuites communes à l’usage ;
vidéo 0,004 $, puis 0,0037 $ à partir de 100 000, puis 0,0034 $ à partir
de 500 000. Audio : 0,00099 / 0,00092 / 0,00085 $.
Les deux lignes sont des scénarios distincts, pas deux franchises à additionner.
Toute piste vidéo/partage d’écran peut faire basculer la session au tarif vidéo.
Pas de plafond dur automatique Daily après la franchise : prévoir quotas
de réservation, durée maximale, contrôle des appels simultanés et alertes,
sans promettre qu’une alerte seule bloque la facturation.

LiveKit : Build 0 $, 5 000 min et 50 GB, non suffisant pour 6 000 min.
Ship 50 $ inclut 150 000 min et 250 GB, surplus 0,0005 $/min
et 0,12 $/GB. Scale 500 $ inclut 1,5 M min et 3 TB, surplus 0,10 $/GB.
Calcul : débit descendant moyen total supposé de 2 Mbit/s par participant,
soit 0,015 GB/min et 90 / 900 / 9 000 GB. Ship pour les deux premiers
cas ; Scale pour le troisième. La qualité et les flux simultanés peuvent
changer fortement le résultat. Ce n’est pas une garantie de facture.
Aucun service IA, téléphonie, enregistrement ou transcription inclus.

Jitsi libre auto-hébergé : licence sans coût d’usage mais serveurs média,
bande passante, TURN, sécurité, supervision et maintenance à financer.
Non recommandé comme première version à faible maintenance.
JaaS géré reste une alternative ; la page officielle de tarifs ne rendait
pas de grille vérifiable pendant l’audit, donc aucun montant inventé.

**Recommandation :** conserver la messagerie en interne pour la phase 1.
Pour un pilote d’appels, Daily Prebuilt réduit le travail d’interface et
d’exploitation. LiveKit mérite réévaluation si le volume croît : sous
l’hypothèse ci-dessus, il devient moins cher mais demande davantage
d’intégration et une surveillance du trafic. Aucun fournisseur activé.
La compatibilité annoncée par un fournisseur n’est pas un test réel de TOMI.

### Phase 1 : coûts sans nouvel abonnement de messagerie

Thèmes, texte, groupes, réactions et enregistrement local ne demandent pas
de licence de chat supplémentaire. Les calculs serveur, opérations et médias
restent payants selon l’usage.
Exemple de volume **retenu** : environ 1 / 10 / 100 GiB stockés, téléchargés
trois fois sur le mois pour 100 / 1 000 / 10 000 membres.
Au tarif App Storage documenté de 0,015 $/GiB-mois et 0,05 $/GiB sortant :
environ 0,17 / 1,65 / 16,50 $ pour stockage + sortie, hors opérations.
Ce n’est pas une estimation de la facture totale ni une promesse de gratuité.
Sans purge, le stockage s’accumule ; un seul envoi de 500 MiB change beaucoup
ce modèle. Scanner antivirus/transcodage éventuels à chiffrer séparément.
À mesurer avant généralisation : utilisateurs simultanés, pièces par mois,
débits, rétention, fréquence de lecture et capacité API/base.

## 6. Vérifications et autorisations

- Capturer des comptes/identifiants historiques sans lire des chats inutilement,
  comparer avant/après la migration et tester sa transaction.
- Deux comptes existants consentants + un troisième non participant :
  envoi/lecture, groupes, refus/retrait, thèmes indépendants, PDF/image,
  voix aller-retour, échec/retry sans doublon, pagination, blocage/signalement.
- Refus d’accès tiers et Founder non participant, URLs expirées,
  injection de type de fichier, limites et concurrence.
- Matrice physique iPhone Safari / Android Chrome / Chrome et Safari desktop,
  clavier, interruption, permissions refusées et reconnexion ; ne pas assimiler
  un test Chromium en petit écran à une preuve Safari.
- Appels et conférences testés seulement dans leurs phases respectives.

L’approbation à demander maintenant porte sur **la phase 1 en développement**
et la préparation de son schéma, pas l’application d’une migration, un service
payant, une activation de notifications externes ou une publication.
Présenter le SQL séparément avant application. Les cinq tables de newsletter
précédemment préparées restent non appliquées et hors de ce chantier :
ne pas lancer toutes les migrations en attente pour installer Connect.

## Sources officielles

- https://www.daily.co/pricing/video-sdk
- https://docs.daily.co/docs/guides/architecture-and-monitoring/intro-to-video-arch
- https://livekit.io/pricing (redirige vers livekit.com/pricing)
- https://jaas.8x8.vc/
- https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-requirements
- https://docs.replit.com/billing/object-storage-billing
