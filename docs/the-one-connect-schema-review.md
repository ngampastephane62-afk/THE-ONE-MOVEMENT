# The One Connect — schéma de phase 1 en revue

Statut : SQL généré et contrôlé, **aucune application ni activation**.

Proposition :
`lib/db/drafts/connect/review/0001_connect_phase1_review.sql`.
La référence `0000_reference_only_never_apply.sql` n’est pas une migration
à exécuter : elle sert uniquement à produire et vérifier la différence.
Ce dossier n’est utilisé par aucun script de migration actif.

## Neuf tables additives

1. `connect_preferences` : thème personnel, présence masquée par défaut,
   aperçus de notification désactivés par défaut.
2. `connect_conversations` : groupes et référence unique aux conversations
   directes existantes, sans remplacer leurs identifiants.
3. `connect_participants` : invitations, acceptation/refus, rôles, départ,
   début d’historique autorisé, lecture individuelle, silence et archive.
4. `connect_messages` : messages de groupe et métadonnées des messages directs,
   référence unique au message historique plutôt qu’une copie de son texte,
   réponse, version, suppression logique et clé d’envoi anti-doublon.
5. `connect_attachments` : fichiers privés distincts du Feed/News, propriétaire,
   conversation, taille, type déclaré, durée, validation et état de scan.
6. `connect_reactions` : réactions personnelles uniques par message/emoji.
7. `connect_pins` : épingles et auteur de l’action.
8. `connect_events` : événements sans texte privé pour rafraîchissement
   différentiel et notifications autorisées.
9. `connect_signals` : frappe et présence avec expiration, pas un historique
   permanent des connexions.

## Compatibilité et confidentialité

Les tables historiques, leurs colonnes et leurs index restent identiques.
Les nouveaux modèles ne sont pas exportés dans le schéma d’exécution :
l’application continue à utiliser sa messagerie actuelle.
L’intégration directe doit maintenir les écritures texte historiques et le
booléen de lecture dans une transaction avec les métadonnées nouvelles.
La lecture paginée doit inclure les messages historiques sans métadonnées,
sans duplication ni migration qui les marquerait automatiquement lus.
La création des références se fait seulement après contrôle de participation.
Pour un groupe, un nouveau membre voit l’historique depuis son acceptation,
et le départ ou retrait révoque l’accès ; la réinvitation exige une nouvelle
acceptation et une nouvelle limite d’historique.

Les contraintes empêchent de lier une pièce jointe, un événement de message ou
un curseur de lecture à une autre conversation. Les vérifications d’identité,
de blocage, de rôle, de réponse au sein du même chat et de visibilité devront
être implémentées et testées côté serveur : le SQL ne les remplace pas.
Le Founder ne bénéficie d’aucun accès administratif universel à ces tables.

Les fichiers ne sont pas stockés en base, seulement leurs métadonnées.
Un état `not_supported` du scanner ne signifie pas « analysé et sain » ;
le serveur doit refuser ou maintenir en quarantaine les catégories exigeant
un scanner indisponible, notamment les documents Office.
Les formats détectés, droits, plafonds et résultat de scan sont revérifiés
avant publication d’un message ou téléchargement.
Le plafond vidéo préparé est 500 MiB ; les autres fichiers ont un plafond
technique conservateur de 20 MiB, à confirmer avant activation.
Les notes vocales et durées de conservation nécessitent encore une politique
explicite ; aucune purge des messages historiques n’est prévue ou autorisée.

## Isolation vis-à-vis de la newsletter

Le journal actif contient déjà une proposition newsletter non appliquée.
Il reste inchangé. Le SQL Connect est préparé dans un dossier séparé et ne
crée aucune table newsletter. Ne pas lancer toutes les migrations en attente.

Avant une application en développement, vérifier par hash et journal que la
proposition newsletter est bien non appliquée dans cet environnement.
Préparer ensuite une réorganisation uniquement des propositions non appliquées :
Connect dans la prochaine position exécutable, newsletter conservée hors de
la file active comme proposition différée, snapshots régénérés cohérents.
Ne jamais modifier une migration appliquée, ni avancer artificiellement le
curseur Drizzle au-delà d’une migration antérieure en attente.
Demander l’accord sur cette intégration sélective avant application.

## Vérification de cette préparation

- Génération Drizzle sans connexion à une base.
- Compilation TypeScript du package DB.
- Tests statiques : neuf tables seulement, aucune modification des modèles
  existants, isolation du journal, contraintes de portée, confidentialité par
  défaut, index de pagination et déduplication.
- Pas de test d’exécution SQL PostgreSQL ni de parcours utilisateur à ce stade.
- Aucun appel, abonnement, email, redémarrage ou déploiement.

Prochaine étape : autoriser l’intégration sélective et l’application en
développement de Connect, en maintenant la newsletter différée ; ensuite
implémenter les contrats API, contrôles serveur et interfaces de phase 1.
