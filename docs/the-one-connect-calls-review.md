# The One Connect — pilote Daily et contrôle du budget

Statut : proposition à approuver. Aucun SQL généré ou appliqué, aucune salle
créée, aucun appel lancé et aucun changement de production.

## Périmètre proposé

Appels privés audio et vidéo entre deux membres d'une conversation existante
acceptée. Une invitation d'appel doit être acceptée séparément. Aucune
activation automatique du micro ou de la caméra. Les réunions de groupe,
l'enregistrement, la transcription et la diffusion publique ne sont pas inclus
dans ce premier pilote.

Daily est le fournisseur retenu ; le budget autorisé est de 20 USD par mois.
La clé a été acceptée par le contrôle GET de configuration du domaine, puis
l'API des réunions a indiqué zéro réunion pour novembre 2026. Ces contrôles
ne constituent pas un relevé de facturation ni une garantie de coût.

## Budget conservateur

- Un seul budget mensuel pour le pilote, pas un budget par membre.
- Montants entiers en millionièmes de dollar, pas de flottants monétaires.
- Plafond approuvé : 20 000 000 micro-USD ; seuil opérationnel proposé :
  18 000 000 micro-USD pour garder une marge de 2 USD.
- Valoriser les deux modes au tarif vidéo conservateur de 0,004 USD par
  minute-participant ; ne pas déduire une franchise gratuite présumée disponible.
- Réserver avant l'invitation le coût maximal des deux places pour une salle
  limitée à 15 minutes, plus une marge d'arrondi et de terminaison.
- Sérialiser les réservations par verrou PostgreSQL du budget mensuel.
- L'estimation engagée, les réservations en cours et l'usage global observé
  chez Daily ne doivent pas être additionnés deux fois. Utiliser la borne
  conservatrice la plus élevée, puis les réservations encore non couvertes.
- Ne rendre un montant disponible qu'après preuve qu'aucun jeton utilisable ou
  appel facturable ne subsiste ; un timeout n'est pas une preuve d'échec.
- Arrêter les nouvelles admissions lorsque le seuil est atteint, lorsque
  l'usage nécessaire n'est pas vérifiable ou lorsque le fournisseur refuse la
  requête. L'échec ne doit pas produire un faux montant nul.
- Faire expirer la salle et ses jetons chez Daily, avec expulsion imposée
  côté fournisseur ; ne pas dépendre d'un onglet ouvert ou du serveur éveillé.
- Borner chaque salle à son mois budgétaire. Aucun transfert de solde au
  changement de mois et aucun renouvellement automatique de l'appel.
- Désactiver enregistrement, transcription et autres services payants annexes.
- Une salle inconnue ou un autre usage du compte doit empêcher de considérer
  le registre TOMI comme un relevé complet du compte Daily.

Daily ne fournit pas ici un plafond de facture garanti. La TVA, les usages
extérieurs à TOMI, les changements de tarifs et les délais de mesure doivent
rester explicitement distingués de l'estimation contrôlée dans l'application.

Le pilote est exclusivement en développement. La production reste désactivée.
Ne jamais créer un second budget de 20 USD indépendant en production sans
réconcilier l'usage du même compte et gérer les réservations entre environnements.
Un changement de domaine Daily exige une réconciliation, pas une remise à zéro.

## Deux tables additives proposées

### connect_call_budgets

- `month_utc` : texte YYYY-MM, clé primaire.
- `provider_domain_id` : texte non vide ; identifiant du domaine Daily, pas la clé.
- `limit_micro_usd` : entier, plafond validé de 20 000 000.
- `admission_limit_micro_usd` : entier, seuil opérationnel de 18 000 000.
- `reserved_micro_usd`, `committed_micro_usd` : entiers non négatifs.
- `provider_observed_micro_usd` : entier non négatif ou NULL si inconnu.
- `provider_checked_at` : timestamptz nullable.
- `paused` : booléen, vrai par défaut jusqu'à validation de l'usage.
- `created_at`, `updated_at` : timestamptz.

Contraintes : format mensuel valide, montants non négatifs, seuil opérationnel
inférieur ou égal au plafond, engagement local et réservations bornés par le
seuil opérationnel. La clé primaire sert de verrou de réservation.

### connect_call_sessions

- `id` : UUID, clé primaire générée côté serveur.
- `budget_month_utc` : référence obligatoire au budget mensuel.
- `thread_id` : référence à une conversation directe historique.
- `initiator_id`, `recipient_id` : références aux profils existants.
- `mode` : texte contraint à audio ou video.
- `status` : texte contraint à ringing, provisioning, active, declined,
  missed, cancelled, ended, failed ou uncertain.
- `client_request_id` : UUID pour l'anti-doublon d'une demande du même initiateur.
- `provider_room_name` : texte nullable unique, aléatoire et sans identité membre.
- `reserved_micro_usd` : entier strictement positif.
- `reservation_state` : texte contraint à reserved, committed ou released.
- `ring_expires_at`, `provider_expires_at` : timestamptz.
- `answered_at`, `ended_at` : timestamptz nullable.
- `created_at`, `updated_at` : timestamptz.

Contraintes : deux membres distincts, unicité initiateur/client_request_id,
unicité des salles et une seule session en cours par conversation. Index de
recherche des invitations entrantes, des appels en cours et du mois budgétaire.
Pas de suppression en cascade de profils, conversations ou messages.

## Sécurité et compatibilité

Les identités viennent de la session authentifiée, pas d'un identifiant fourni
par le navigateur. Vérifier l'activation membre, la conversation acceptée et
les blocages dans les deux sens à chaque transition et émission de jeton.
Une invitation d'appel n'ouvre pas de droit sur une autre conversation.

Salles Daily privées, deux places, jetons courts liés à la salle et au membre,
sans privilège de propriétaire Daily. Ne stocker ni clé API, ni jeton de
réunion, ni média, ni texte privé dans ces tables ou les journaux.

Le Founder ne reçoit pas d'accès universel aux appels privés. Le suivi du budget
est agrégé. Préserver toute la messagerie historique et ses identifiants.
Les nouveaux modèles ne justifient aucune modification des tables existantes,
de la newsletter différée, des paiements ou des règles de publication.

## Migration, revue et retour arrière

Après approbation seulement : déclarer les modèles, générer le SQL Drizzle,
vérifier le journal et les migrations appliquées, puis inspecter le SQL exact.
Le SQL attendu crée uniquement ces deux tables, leurs contraintes et index.
Tout DROP, TRUNCATE, changement de table existante ou migration différée
inattendue impose l'arrêt et une nouvelle revue.

L'application en développement et un redémarrage sécurisé de l'API sont des
autorisations distinctes de la préparation SQL. Rien en production.

Pour désactiver le pilote : bloquer les nouvelles admissions, laisser expirer
ou terminer les salles existantes et conserver les registres pour rapprochement.
Un retour du code ne doit pas effacer les engagements financiers. Ne pas
proposer DROP comme retour arrière d'un pilote ayant réellement servi.

## Sources techniques

- https://docs.daily.co/reference/rest-api/domain/get-domain-config
- https://docs.daily.co/reference/rest-api/meetings/list-meetings
- https://docs.daily.co/reference/rest-api/rooms/create-room
- https://docs.daily.co/reference/rest-api/meeting-tokens/create-meeting-token
