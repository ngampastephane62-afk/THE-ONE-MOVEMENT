# Connect — SQL en revue, non appliqué

Ce dossier est volontairement indépendant du journal actif `lib/db/drizzle`.
Il n’autorise aucune migration ou activation et n’est pas un second migrateur.
Les nouvelles déclarations ne sont pas exportées par le schéma d’exécution.

Depuis `lib/db`, génération sans connexion à une base :

1. `pnpm exec drizzle-kit generate --schema ./src/schema/index.ts --out ./drafts/connect/review --dialect postgresql --name reference_only_never_apply`
2. `pnpm exec drizzle-kit generate --config ./drafts/connect/drizzle.config.ts --name connect_phase1_review`

Le premier SQL est uniquement une référence de comparaison ; **ne jamais
l’appliquer**. Seul le second SQL constitue la proposition Connect.
Il ne doit contenir que les neuf nouvelles tables `connect_*`, contraintes
et index, sans référence aux tables newsletter.

Avant toute application autorisée : contrôler l’état réel du journal principal.
La migration newsletter en attente ne peut pas être appliquée implicitement.
Présenter une intégration sélective et cohérente du SQL Connect dans le journal
de développement (y compris les snapshots), préserver la proposition newsletter,
puis faire approuver son application. Ne pas lancer `db:migrate` en bloc ni
marquer une migration ultérieure appliquée en sautant une migration antérieure :
le curseur Drizzle pourrait alors ignorer cette dernière définitivement.

Ne pas publier les routes Connect avant la migration et les tests.
Pas de DDL au démarrage, au build ou dans un migrateur de production.
