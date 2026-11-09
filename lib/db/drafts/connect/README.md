# Connect — préparation intégrée après autorisation

Le brouillon isolé a été intégré dans le journal principal après accord.
Le SQL de référence temporaire et ses snapshots ont été retirés pour éviter
qu’une personne les prenne pour un second parcours de migration.

Source de vérité : `lib/db/drizzle/0021_connect_phase1.sql` et son snapshot.
La proposition newsletter reste conservée mais hors du journal actif :
voir `lib/db/drizzle/DEFERRED.md`.

La migration Connect est appliquée uniquement en développement. Cela ne
signifie pas que ses routes ou interfaces sont implémentées ou activées.
