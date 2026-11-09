# Community communications — proposition soumise à approbation

Statut : schéma approuvé et SQL généré/revu, mais NON appliqué.
Migration préparée : `lib/db/drizzle/0021_community_communications.sql`.
Aucun abonnement automatique, aucun email ni job programmé activé.
La migration crée uniquement les cinq tables ci-dessous, leurs contraintes
et index ; aucune table existante modifiée, aucune donnée insérée.
La référence entre livraisons et éditions interdit la suppression d’une
édition encore référencée. Les contrôles SQL imposent aussi une trace de
consentement pour les préférences email et une approbation avant activation.

## Réutilisation et périmètre

Réutiliser Clerk, le rapprochement des inscriptions Founder et sa date de
référence, Resend, le répertoire et les règles de visibilité, les actualités
publiées, les composants Founder et l’éditeur existant. Aucun CRM, paiement,
changement Stripe, rôle ou fournisseur d’authentification supplémentaire.

Les profils incomplets ont accès à la communauté générale ; ne pas exiger
100 % de complétion ni un secteur pour consulter la communauté.
La découverte publique reste volontaire : vérifier à chaque lecture
visibilité, suspension, blocages et disponibilité du profil.
Ne jamais annoncer un email privé ni une coordonnée personnelle.
La notification administrative reste indépendante de la visibilité publique.

## Schéma additif proposé : cinq tables

1. `community_communication_preferences`
   - `clerk_id text PRIMARY KEY`
   - `frequency text NOT NULL DEFAULT 'in_app'`, CHECK daily/weekly/in_app/off
   - `welcome_allowed boolean NOT NULL DEFAULT false`
   - `consented_at timestamptz NULL`, `consent_version text NULL`
   - `suppressed_at timestamptz NULL`, `suppression_reason text NULL`
   - `updated_at timestamptz NOT NULL`
   - aucune adresse destinataire dupliquée ; relire l’identité vérifiée au moment
     de l’envoi. L’absence de préférence signifie aucun opt-in email.

2. `community_activity_events`
   - `id uuid PRIMARY KEY`, `event_key text UNIQUE NOT NULL`
   - `kind text NOT NULL`, `subject_clerk_id text NOT NULL`
   - `occurred_at timestamptz NOT NULL`, `created_at timestamptz NOT NULL`
   - événement de bienvenue vérifiée unique par identité, seulement après la
     date de démarrage ; pas de rattrapage automatique des anciens comptes.
   - pas de copie persistante de coordonnées ou d’un profil privé ; projection
     publique recalculée avec les contrôles de découverte existants.

3. `community_email_settings`
   - `id integer PRIMARY KEY CHECK (id = 1)`
   - `paused boolean NOT NULL DEFAULT true`
   - `timezone text NOT NULL`, `send_hour integer CHECK 0..23`
   - `weekly_day integer CHECK 0..6`
   - `introduction text NOT NULL DEFAULT ''`
   - `first_approved_at timestamptz NULL`, `approved_by_clerk_id text NULL`
   - `baseline_at timestamptz NOT NULL`, `updated_at timestamptz NOT NULL`
   - fuseau et horaire explicitement confirmés par le Founder avant activation ;
     aucun fuseau de navigateur implicitement transformé en réglage global.

4. `community_email_runs`
   - `id uuid PRIMARY KEY`, `kind text NOT NULL`
   - `period_key text NOT NULL`, UNIQUE(kind, period_key)
   - `status text NOT NULL`, CHECK draft/approved/running/completed/paused
   - `period_start timestamptz`, `period_end timestamptz`
   - `featured_article_ids integer[] NOT NULL DEFAULT '{}'`
   - `approved_content_hash text NULL`, `approved_at timestamptz NULL`
   - `created_at timestamptz NOT NULL`, `updated_at timestamptz NOT NULL`
   - contenu issu de données réelles, liens validés ; ne pas envoyer de contenu
     vide. L’approbation porte sur une version précise du premier aperçu.

5. `community_email_deliveries`
   - `id uuid PRIMARY KEY`, `run_id uuid NULL REFERENCES community_email_runs(id)`
   - `clerk_id text NOT NULL`, `kind text NOT NULL`
   - `dedupe_key text UNIQUE NOT NULL`, `idempotency_key text UNIQUE NOT NULL`
   - `status text NOT NULL`, CHECK queued/claimed/accepted/delivered/bounced/
     complained/suppressed/failed/unknown
   - `provider_id text UNIQUE NULL`
   - `attempts integer NOT NULL DEFAULT 0`, `claim_expires_at timestamptz NULL`
   - `next_attempt_at timestamptz NULL`, `last_error_code text NULL`
   - `provider_event_at timestamptz NULL`, `provider_event_id text NULL`
   - `created_at timestamptz NOT NULL`, `updated_at timestamptz NOT NULL`
   - même clé de déduplication quotidienne pour tous les résumés de routine
     d’un destinataire, y compris en cas de changement daily/weekly ;
     clé permanente distincte pour l’unique bienvenue.
   - index de travail sur status/next_attempt_at et sur clerk_id/created_at.

Pas de DROP, remplacement de table, migration destructive ou réécriture des
publications/membres. Aucun historique personnel existant à importer dans ces
tables par défaut.

## Sécurité et envois

Les modifications de préférences authentifiées utilisent le propriétaire Clerk
et le contrôle d’origine existant. Le lien de désabonnement signé ne divulgue
pas l’email, ne réactive jamais un consentement et ne comporte pas de redirection
externe. Désabonnement accessible sans connexion, choix de fréquence dans My Space.

Les webhooks Resend doivent être signés et vérifiés avant tout changement de
statut ; ignorer les événements anciens et rendre les mises à jour répétées
idempotentes. Rebond permanent/plainte impose une suppression avant nouvel envoi.
Un HTTP d’acceptation ne doit pas être présenté comme une livraison.

L’état inconnu d’une requête fournisseur ne déclenche pas de renvoi aveugle.
Respecter la durée de déduplication fournisseur, les limites et Retry-After.
Prendre les tâches via verrou/claim PostgreSQL afin d’éviter les doublons
entre instances Autoscale. Vérifier les préférences juste avant l’envoi.
Le mode test vise exclusivement le destinataire Founder confirmé ; aucun
envoi à toute la liste pour tester.

## Planification et validations

Ne pas dépendre exclusivement d’un setInterval dans un serveur Autoscale
susceptible de s’endormir. Prévoir un déclencheur Replit Scheduled distinct,
ou un ordonnanceur existant vérifié, authentifié et réutilisant la même file.
Ne pas provisionner ni activer cette ressource facturable sans accord.

Ordre requis :
1. Approbation du schéma et préparation du SQL, sans application.
2. Revue du SQL et autorisation de migration en développement seulement.
3. Implémentation API/UI, tests de consentement, déduplication et visibilité.
4. Connexion Resend autorisée, lecture du domaine et des DNS réels.
5. Un seul test autorisé au Founder et vérification du résultat fournisseur.
6. Approbation du premier aperçu puis confirmation horaire/fuseau.
7. Publication manuelle et activation explicite du planning.

Pour une base de production PostgreSQL gérée par Replit, la mise à jour du
schéma passe par la publication et sa revue de différence. Aucun DDL exécuté
en production, aucun DDL au démarrage/build, aucun écrasement par les données
de développement. Si la base est externe, confirmer la cible et son processus
documenté séparément avant toute opération.

Retour arrière : garder le planning en pause, désactiver les nouvelles routes
et revenir à la version précédente du code. Conserver les tables additives et
l’historique de consentement/envoi plutôt que les supprimer.
