# TOMI — Proposition de profils Individuel / Organisation

## État et autorisation

Schéma approuvé par le Founder ; SQL ensuite appliqué avec son autorisation distincte, en développement uniquement. Les 27 profils existants sont conservés et leurs anciennes données sont inchangées. Les cinq champs sont encore vides ; leurs contrats propriétaires et formulaires ne sont pas activés. Les permissions, Clerk et la production restent inchangés.

La migration canonique appliquée est `lib/db/drizzle/0016_member_profile_extension.sql`. La copie de revue est historique et ne doit pas être rejouée. Aucune autorisation de déploiement n’a été donnée. Les nouvelles règles des trois secteurs actifs et de visibilité de localisation sont distinctes ; leur proposition complémentaire figure dans `reports/task32-architecture-status.html`.

## Ce qui fonctionne déjà

Clerk authentifie une seule identité. `ecosystem_members.clerk_id` est unique ; le profil existant conserve son identifiant. Nom, profession, organisation, pays, biographie, site, secteurs suivis et préférences de visibilité sont déjà enregistrés. L’email de compte est vérifié par Clerk ; il n’est pas demandé une seconde fois ni publié.

La nouvelle interface réutilise ces champs. Aucun faux type de compte n’est enregistré dans la biographie, le métier, le stockage du navigateur ou une seconde table de membres.

## Extension exacte proposée

Ajouter à `ecosystem_members` cinq colonnes facultatives pour les anciens profils :

| Colonne | Type proposé | Usage et limites |
|---|---|---|
| `account_type` | `text`, nullable ; contrainte `individual` ou `organization` | Choix explicite du propriétaire, jamais déduit de son employeur. |
| `city_region` | `varchar(120)`, nullable | Ville ou région de résidence pour un individu ; donnée privée. |
| `organization_type` | `varchar(100)`, nullable | Type d’organisation renseigné par le propriétaire ; donnée privée. |
| `contact_name` | `varchar(100)`, nullable | Personne de contact de l’organisation ; jamais nom d’affichage public implicite. |
| `main_sector` | `text`, nullable ; valeur parmi les 17 identifiants officiels | Secteur principal explicite, indépendant des autres intérêts. |

Pas de date de naissance par défaut, de nouveau mot de passe, de nouveau compte Clerk, de copie de l’email en base, de rôle d’administrateur d’organisation ni d’accès collectif créé automatiquement.

Pas de marqueur « onboarding terminé » artificiel nécessaire à ce stade : l’API pourra calculer le niveau de complétude à partir du type et des champs requis. Un ancien profil ne sera ni classé automatiquement ni bloqué.

## Validation du parcours

**Individu :** nom, email Clerk, pays, ville/région, profession et secteur principal ; intérêts complémentaires et biographie facultative.

**Organisation :** nom de l’organisation dans le champ d’organisation existant, type, pays, personne de contact privée, email du compte comme contact vérifié, secteur principal, description ; site facultatif. Le nom d’affichage de l’organisation doit être explicitement confirmé, distinct du contact privé.

Le choix avant authentification peut être transmis comme paramètre non sensible à l’étape suivante ; il ne devient un type de compte enregistré qu’après validation par l’API authentifiée.

L’enregistrement met à jour le profil lié à la session Clerk. Il ne crée pas un second membre. Une organisation représente ici un profil sous la responsabilité du même compte, pas une structure multi-utilisateurs ou un nouveau tenant Clerk.

Les anciens membres gardent leurs données et leur accès. Une invitation de complétion utilise le profil prérempli, sans demande de nouvelle adhésion.

## Contrat et confidentialité

Étendre uniquement le contrat d’entrée et la projection du propriétaire pour ces cinq champs. Les DTO publics, profils imbriqués dans le fil, résultats de recherche et caches publics ne doivent pas hériter de ces champs.

La complétude et les recommandations sont des informations privées du membre. L’affichage public reste volontaire et ne devient pas obligatoire pour suivre un secteur.

Un changement volontaire de type de profil doit expliquer les conséquences sur le nom public, sans modifier les messages, médias, abonnements, certifications ou rôles existants.

## Séquence après approbation du schéma

1. Modifier le schéma Drizzle et les contrats propriétaires, puis générer le SQL.
2. Présenter le SQL exact, ses contraintes et les vérifications préalables.
3. Obtenir l’autorisation distincte d’application en développement.
4. Appliquer uniquement en développement, préserver les lignes existantes.
5. Brancher les deux formulaires et l’édition ultérieure ; tester création, modification, rechargement et confidentialité.
6. Aucune mise en production sans autorisation Founder séparée.

## Autres extensions identifiées — non autorisées ni implémentées

### Publications réellement rattachées à des secteurs

Le fil existant, ses commentaires, likes, blocages et signalements restent utilisables. La sélection des secteurs des auteurs n’est pas un classement explicite de chaque publication.

Une extension dédiée devra prévoir les identifiants des secteurs d’une publication, une visibilité choisie, un état de revue et l’auteur/date de décision. Les nouvelles publications sectorielles attendront une revue ; les éditions de texte ou média devront repasser en revue. Les publications ordinaires existantes ne seront ni migrées automatiquement ni masquées. Les contrôles d’activation, de suspension, de blocage et les restrictions commerciales existantes restent inchangés. Un flux public devra exiger un accord public explicite et ne jamais divulguer les contacts privés.

### Offres sectorielles

La table `opportunities` existe avec titre, catégorie, description, conditions, localisation, date limite et statut historique. Son statut `open` ne prouve pas une validation éditoriale.

Avant exposition : prévoir un rattachement aux secteurs, une validation distincte, le responsable et la date de publication, les états brouillon/en revue/publié/expiré et un filtrage serveur des échéances dépassées. Les données anciennes restent conservées et ne deviennent pas des annonces approuvées par défaut. Le tableau de revue et les parcours de réponse nécessitent leur propre contrat et approbation.

### Catalogue pédagogique

Les ressources externes réellement référencées fonctionnent déjà. Un catalogue administrable devra distinguer articles, guides, livres, cours et vidéos ; stocker source, auteur, secteurs, droits/licence, date de vérification et état de revue. Aucun ouvrage protégé ne sera téléversé sans autorisation. Un suivi de cours ou une certification ne doit pas être déduit d’un simple lien ou favori.

### Documents confidentiels

Les deux présentations actuellement accessibles ont été approuvées pour diffusion publique. Elles sont désormais proposées uniquement depuis leur parcours respectif, mais ne sont pas reclassées confidentielles par simple masquage.

Pour tout futur document confidentiel : original en stockage privé, demande et accord traçables, accès nominatif authentifié, expiration/révocation, contrôle serveur de lecture et téléchargement, absence de route statique publique et cache privé. Ce parcours n’est pas activé par cette livraison.
