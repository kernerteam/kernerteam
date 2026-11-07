# Infrastructure du site Kerner Team

Ce document décrit comment le site est hébergé, mis à jour et administré. Il ne traite pas du design.

## Objectifs

- **Site statique** : du HTML généré, sans serveur ni base de données à maintenir.
- **Gratuit**, hormis les noms de domaine.
- **Contenu modifiable par un non-développeur** (planning, coachs, tarifs, FAQ, textes, documents) depuis une interface web.
- **Transmissible** : le site doit continuer à fonctionner et à être modifiable sans son créateur.

## État actuel (novembre 2026)

| Élément | Situation |
|---|---|
| Site | `kernerteam.net`, sur GoDaddy Website Builder (abonnement payant, environ 10 à 20 €/mois au renouvellement, à confirmer sur la facture) |
| `kernerteam.com` | Chez OVH. Redirige vers `kernerteam.net` en HTTP, mais le **HTTPS est cassé** : OVH présente son certificat par défaut, ce qui déclenche une alerte de sécurité dans le navigateur |
| `kernerteam.fr` | N'existe pas |
| Planning | Un PDF téléchargeable, absent des pages |
| Messagerie | Widget de messagerie intégré à GoDaddy |

## Stack cible

| Brique | Rôle | Coût |
|---|---|---|
| **GitHub** | Dépôt du code et du contenu, historique, gestion des accès | Gratuit |
| **Astro** | Génère le site statique à partir des fichiers de contenu | Gratuit (open source) |
| **Sveltia CMS** | Interface d'administration sur `/admin` | Gratuit (open source) |
| **Cloudflare Workers** (Worker `kernerteam`, compte « Kerner Team », config `wrangler.jsonc`) | Construit et héberge le site (fichiers statiques), HTTPS automatique. Sert aussi le relais de connexion de `/admin` (`auth/index.js`, uniquement sur `/auth` et `/callback`) | Gratuit |
| Noms de domaine | `kernerteam.net` (et `kernerteam.com`) | Environ 15 à 30 €/an pour les deux |

**Il n'y a aucune base de données.** Tout le contenu est stocké sous forme de fichiers (YAML et Markdown) dans le dépôt Git.

## Fonctionnement d'une mise à jour

```
Éditeur                      GitHub                      Cloudflare Workers
───────                      ──────                      ──────────────────
<site>/admin
(HTML + JS statique)
  │ 1. connexion ──────────▶ OAuth GitHub
  │                          (via /auth et /callback du Worker)
  │ 2. lecture du contenu ─▶ API GitHub
  │ 3. modification dans un formulaire
  │ 4. « Publier » ────────▶ commit sur main ──────────▶ 5. détection du push
                                                         6. build Astro
                                                         7. mise en ligne (~1 min)
```

1. `/admin` est une page statique servie avec le site. Elle contient le script Sveltia CMS et un fichier `config.yml` qui décrit les formulaires (champs, listes déroulantes, emplacement des fichiers).
2. L'interface tourne dans le navigateur de l'éditeur. Elle lit et écrit les fichiers du dépôt via l'API GitHub, avec les droits de l'éditeur.
3. Chaque « Publier » crée un commit sur `main`.
4. Cloudflare (Workers Builds) détecte le commit, reconstruit le site et le met en ligne.

## Authentification

- Les accès sont gérés par **GitHub**, pas par le site.
- Pour pouvoir modifier le contenu, il faut un compte GitHub (avec la double authentification activée) et un **droit d'écriture sur le dépôt** (collaborateur).
- Ajouter ou retirer quelqu'un se fait dans les paramètres du dépôt GitHub. Il n'y a aucun mot de passe à gérer côté site.
- OAuth exige un *client secret*, qu'on ne peut pas stocker dans un site statique. C'est pourquoi le Worker du site sert d'intermédiaire sur `/auth` et `/callback`. Le code (`auth/index.js`) est une copie du relais [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth). Il lit deux secrets, `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET`, réglés dans Worker `kernerteam` → Settings → Variables and Secrets. Il refuse les sites absents de `ALLOWED_DOMAINS` (`wrangler.jsonc`). Il se configure une fois, puis on n'y touche plus.

## Historique et retour arrière

- Chaque modification est un commit Git, avec son auteur, sa date et le détail des changements.
- **Annuler une modification** : `git revert` du commit concerné, ou redéploiement d'une version précédente depuis le tableau de bord Cloudflare (Worker `kernerteam` → Deployments).
- **Images et documents** envoyés depuis `/admin` : ils sont commités dans le dépôt (par exemple `public/images/`, `public/documents/`).
- **Garde-fou** : Astro valide le format des données au moment du build. Si une donnée est invalide (un cours sans heure de fin, par exemple), le build échoue et **la version précédente reste en ligne**.

## Emplacement du contenu

| Contenu | Fichier(s) | Dans `/admin` |
|---|---|---|
| Planning | `src/data/planning.yaml` | Planning |
| Coachs (texte + photo) | `src/content/coachs/*.md` et `*.jpg` (un fichier par coach, photo à côté) | Coachs |
| Textes longs des pages | `src/content/textes/*.md` | Textes des pages |
| Coordonnées, réseaux, adresses des salles | `src/data/site.yaml` | Infos, tarifs et FAQ → Coordonnées et salles |
| Tarifs | `src/data/tarifs.yaml` | Infos, tarifs et FAQ → Tarifs |
| FAQ | `src/data/faq.yaml` (la question sur le cours d'essai est dans `src/content/textes/essai.md`) | Infos, tarifs et FAQ → FAQ |
| Titres et atouts de l'accueil | `src/data/accueil.yaml` | Infos, tarifs et FAQ → Accueil |
| Documents à télécharger | `src/data/documents.yaml` + fichiers dans `public/documents/` | Infos, tarifs et FAQ → Documents |

Les règles de validation sont dans `src/content.config.ts`, les formulaires de l'admin dans `public/admin/config.yml`. Les deux doivent rester cohérents.

Les photos des salles, le logo, le portrait de Guillaume, le bandeau d'archives et le fond (`background.png`) sont dans `src/assets/images/`. Ils ne sont pas modifiables depuis `/admin` : les changer demande une modification du code (voir `src/pages/index.astro` et `src/pages/equipe.astro`).

## Développement local

```sh
npm install
npm run dev       # site sur http://localhost:4321
npm run build     # génère dist/ (c'est ce que fait Cloudflare)
npx wrangler dev  # après le build : sert le site exactement comme Cloudflare (page 404, /auth)
```

- Node.js 22.23 ou plus récent (le fichier `.node-version` fixe Node 24, lu aussi par Cloudflare). Le projet utilise Astro 7 ; les espaces insécables de la typographie française passent par un plugin remark (`src/lib/typo.mjs`), d'où la dépendance `@astrojs/markdown-remark`.
- **Tester `/admin` sans GitHub** : lancer `npm run dev`, ouvrir `http://localhost:4321/admin/` dans Chrome ou Edge et choisir « Work with Local Repository » (Sveltia CMS modifie alors directement les fichiers du dossier local).
- Sveltia CMS est chargé depuis unpkg sans numéro de version (`public/admin/index.html`), ce qui le garde à jour automatiquement. En cas de régression d'une nouvelle version, on peut figer une version : `https://unpkg.com/@sveltia/cms@0.261.0/dist/sveltia-cms.js`.

## Dossier d'inscription en ligne

Le formulaire de la page Tarifs & inscription (composant `src/components/DossierInscription.astro`, affiché directement, lien direct `/tarifs/#dossier`) remplit les documents originaux (fiche d'adhésion, autorisation parentale pour les mineurs, règlement intérieur) et les rassemble en un seul PDF.

- **Tout se passe dans le navigateur** (bibliothèque `pdf-lib`, chargée uniquement au moment de générer le PDF). Aucune donnée n'est envoyée ni stockée : pas de serveur, pas de base de données, pas de question RGPD liée au stockage.
- **Modèles utilisés** : `src/assets/modeles/` (copies figées des documents). Les documents téléchargeables de `public/documents/` (modifiables depuis `/admin`) en sont indépendants : remplacer un document dans l'admin ne casse pas le générateur.
- **Positions des champs** : en pixels sur les images de référence, dans `src/lib/inscription.ts` (cases d'abonnement) et `src/lib/dossier-pdf.ts` (tous les autres champs). Si un modèle change, il faut remplacer le fichier dans `src/assets/modeles/` et recaler ces coordonnées.
- Le dossier n'est pas transmis automatiquement au club : l'adhérent l'imprime et l'apporte avec le certificat médical. Un envoi automatique demanderait un service d'envoi (Worker + e-mail) et une réflexion RGPD (données de mineurs, données de santé).

## Indexation par les moteurs de recherche

Par défaut, toutes les pages portent `<meta name="robots" content="noindex">` : le site témoin ne doit pas apparaître dans Google. **En production**, ajouter la variable de build `PUBLIC_INDEXABLE=true` (Worker `kernerteam` → Settings → Build → Variables and secrets), puis relancer un déploiement.

## Pourquoi ces choix

- **Cloudflare plutôt que Netlify** : l'offre gratuite de Netlify fonctionnerait désormais avec des crédits mensuels, et le site serait mis en pause en cas de dépassement (à vérifier sur leur page de tarifs). Chez Cloudflare, les fichiers statiques sont servis gratuitement, sans limite de bande passante.
- **Workers plutôt que Pages** : Cloudflare recommande Workers pour les nouveaux projets. Le relais de connexion vit dans le même Worker et le même dépôt : un seul service à transmettre.
- **Sveltia CMS plutôt que Decap CMS** : l'interface est plus simple pour un non-développeur et le projet est activement maintenu. La configuration est compatible avec Decap : en cas de problème, on peut basculer vers Decap en changeant le script chargé dans `/admin`.
- **Pas d'auto-hébergement** : un serveur personnel suppose quelqu'un pour assurer les mises à jour, la sécurité et un éventuel déménagement. L'hébergement statique managé supprime tout ça.

## Mise en place (une seule fois)

Tout appartient à des conteneurs au nom du club, dont les personnes ne sont que membres : l'organisation GitHub `kernerteam` (dépôt et application OAuth) et le compte Cloudflare « Kerner Team » (Worker). Pour passer la main, on invite le nouveau responsable comme **Owner** de l'organisation et **Super Administrator** du compte Cloudflare, puis on se retire si on le souhaite. Un Worker ne se déplace pas d'un compte Cloudflare à un autre : ne jamais le recréer dans un compte personnel.

1. Dépôt `kernerteam/kernerteam`, dans l'organisation GitHub `kernerteam`.
2. Compte Cloudflare « Kerner Team » → Workers & Pages → Create → Import a repository. Choisir le Worker `kernerteam`, build `npm run build`, déploiement `npx wrangler deploy`. Chaque push sur `main` reconstruit le site : `https://kernerteam.kerner-team.workers.dev`.
3. Créer une **application OAuth GitHub dans l'organisation** (`kernerteam` → Settings → Developer settings → OAuth Apps) :
   - Homepage URL : l'adresse du site ;
   - Callback URL : `https://kernerteam.kerner-team.workers.dev/callback`.
4. Ajouter au Worker `kernerteam` les secrets `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET` (Settings → Variables and Secrets, type *Secret*).
5. `base_url` dans `public/admin/config.yml` = l'adresse `workers.dev` du Worker.
6. Ajouter les éditeurs à l'organisation, avec un droit d'écriture sur le dépôt.

## Mise en production

1. Récupérer les accès aux registraires : GoDaddy (`kernerteam.net`) et OVH (`kernerteam.com`).
2. Faire passer le DNS de `kernerteam.net` chez Cloudflare (gratuit). C'est obligatoire pour brancher le domaine sur le Worker.
3. Ajouter `kernerteam.net` et `www.kernerteam.net` comme domaines personnalisés du Worker `kernerteam` (Settings → Domains & Routes). Le relais de connexion peut rester sur l'adresse `workers.dev` : `base_url` et la callback OAuth ne changent pas.
4. Rediriger `kernerteam.com` vers `kernerteam.net` en HTTPS valide, par exemple en faisant aussi passer son DNS chez Cloudflare avec une règle de redirection. Ça corrige le certificat cassé.
5. Vérifier que les nouveaux domaines figurent dans `ALLOWED_DOMAINS` (`wrangler.jsonc`).
6. Ajouter la variable de build `PUBLIC_INDEXABLE=true` pour autoriser l'indexation (voir plus haut).
7. Une fois le nouveau site vérifié, **résilier l'abonnement GoDaddy Website Builder** (sans résilier le domaine).

## Passation

- Le dépôt GitHub, le compte Cloudflare et l'application OAuth doivent appartenir **à Guillaume ou à l'association**, pas à une personne qui quitte la salle. On peut transférer le dépôt (GitHub → Settings → Transfer ownership).
- Garder dans un endroit sûr, connu du propriétaire : les accès aux registraires, au compte Cloudflare et au compte GitHub propriétaire.
- **Sans développeur**, il reste possible de modifier tout le contenu via `/admin`. Le site continue de tourner sans aucune intervention.
- **Avec un développeur**, il devient possible de changer la mise en page, d'ajouter des pages ou des types de contenu (fichiers Astro et `public/admin/config.yml`).

## Points à vérifier

- Le montant réel de l'abonnement GoDaddy actuel (sur la facture).
- Les conditions actuelles des offres gratuites de Cloudflare Workers et Workers Builds au moment de la mise en place.
