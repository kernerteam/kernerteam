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
| **Cloudflare Pages** | Construit et héberge le site, HTTPS automatique | Gratuit |
| **Cloudflare Worker** (`sveltia-cms-auth`) | Relais OAuth pour la connexion GitHub depuis `/admin` | Gratuit (offre Workers gratuite) |
| Noms de domaine | `kernerteam.net` (et `kernerteam.com`) | Environ 15 à 30 €/an pour les deux |

**Il n'y a aucune base de données.** Tout le contenu est stocké sous forme de fichiers (YAML et Markdown) dans le dépôt Git.

## Fonctionnement d'une mise à jour

```
Éditeur                      GitHub                      Cloudflare Pages
───────                      ──────                      ────────────────
<site>/admin
(HTML + JS statique)
  │ 1. connexion ──────────▶ OAuth GitHub
  │                          (via le Worker sveltia-cms-auth)
  │ 2. lecture du contenu ─▶ API GitHub
  │ 3. modification dans un formulaire
  │ 4. « Publier » ────────▶ commit sur main ──────────▶ 5. détection du push
                                                         6. build Astro
                                                         7. mise en ligne (~1 min)
```

1. `/admin` est une page statique servie avec le site. Elle contient le script Sveltia CMS et un fichier `config.yml` qui décrit les formulaires (champs, listes déroulantes, emplacement des fichiers).
2. L'interface tourne dans le navigateur de l'éditeur. Elle lit et écrit les fichiers du dépôt via l'API GitHub, avec les droits de l'éditeur.
3. Chaque « Publier » crée un commit sur `main`.
4. Cloudflare Pages détecte le commit, reconstruit le site et le met en ligne.

## Authentification

- Les accès sont gérés par **GitHub**, pas par le site.
- Pour pouvoir modifier le contenu, il faut un compte GitHub (avec la double authentification activée) et un **droit d'écriture sur le dépôt** (collaborateur).
- Ajouter ou retirer quelqu'un se fait dans les paramètres du dépôt GitHub. Il n'y a aucun mot de passe à gérer côté site.
- OAuth exige un *client secret*, qu'on ne peut pas stocker dans un site statique. C'est pourquoi le Worker Cloudflare `sveltia-cms-auth` sert d'intermédiaire. Il se configure une fois, puis on n'y touche plus.

## Historique et retour arrière

- Chaque modification est un commit Git, avec son auteur, sa date et le détail des changements.
- **Annuler une modification** : `git revert` du commit concerné, ou redéploiement d'une version précédente depuis le tableau de bord Cloudflare Pages.
- **Images et documents** envoyés depuis `/admin` : ils sont commités dans le dépôt (par exemple `public/images/`, `public/documents/`).
- **Garde-fou** : Astro valide le format des données au moment du build. Si une donnée est invalide (un cours sans heure de fin, par exemple), le build échoue et **la version précédente reste en ligne**.

## Emplacement du contenu

| Contenu | Fichier(s) |
|---|---|
| Planning | `src/data/planning.yaml` |
| Coachs | `src/content/coachs/*.md` (un fichier par coach) |
| Tarifs | `src/data/tarifs.yaml` |
| FAQ | `src/data/faq.yaml` |
| Textes des pages | Markdown |
| Documents (règlement, autorisation parentale, fiche d'adhésion) | `public/documents/` |

Les noms de fichiers exacts pourront changer pendant le développement. La référence est `public/admin/config.yml`.

## Pourquoi ces choix

- **Cloudflare Pages plutôt que Netlify** : l'offre gratuite de Netlify fonctionnerait désormais avec des crédits mensuels, et le site serait mis en pause en cas de dépassement (à vérifier sur leur page de tarifs). Cloudflare Pages offre une bande passante illimitée et environ 500 builds par mois, sans mise en pause.
- **Sveltia CMS plutôt que Decap CMS** : l'interface est plus simple pour un non-développeur et le projet est activement maintenu. La configuration est compatible avec Decap : en cas de problème, on peut basculer vers Decap en changeant le script chargé dans `/admin`.
- **Pas d'auto-hébergement** : un serveur personnel suppose quelqu'un pour assurer les mises à jour, la sécurité et un éventuel déménagement. L'hébergement statique managé supprime tout ça.

## Mise en place (une seule fois)

1. Créer le dépôt GitHub.
2. Connecter le dépôt à **Cloudflare Pages**, avec un build déclenché à chaque push sur `main`. Commande de build : `npm run build`. Dossier de sortie : `dist`.
3. **Environnement de test** : ajouter un domaine personnalisé sur un sous-domaine de `marinbecker.me`, avec un CNAME vers `<projet>.pages.dev`. Pour un sous-domaine, le DNS n'a pas besoin d'être chez Cloudflare.
4. Créer une **application OAuth GitHub** (GitHub → Settings → Developer settings → OAuth Apps).
5. Déployer **`sveltia-cms-auth`** sur Cloudflare Workers, avec l'identifiant et le secret de l'application OAuth. Mettre à jour l'URL de callback de l'application OAuth.
6. Renseigner l'URL du Worker (`base_url`) dans `public/admin/config.yml`.
7. Ajouter les éditeurs comme collaborateurs du dépôt.

## Mise en production

1. Récupérer les accès aux registraires : GoDaddy (`kernerteam.net`) et OVH (`kernerteam.com`).
2. Faire passer le DNS de `kernerteam.net` chez Cloudflare (gratuit). C'est obligatoire pour utiliser le domaine racine avec Cloudflare Pages.
3. Ajouter `kernerteam.net` et `www.kernerteam.net` comme domaines personnalisés du projet Pages.
4. Rediriger `kernerteam.com` vers `kernerteam.net` en HTTPS valide, par exemple en faisant aussi passer son DNS chez Cloudflare avec une règle de redirection. Ça corrige le certificat cassé.
5. Mettre à jour l'URL de callback de l'application OAuth et le `base_url` si nécessaire.
6. Une fois le nouveau site vérifié, **résilier l'abonnement GoDaddy Website Builder** (sans résilier le domaine).
7. Remplacer le widget de messagerie GoDaddy par un lien statique (WhatsApp, `tel:`, `mailto:`).

## Passation

- Le dépôt GitHub, le compte Cloudflare et l'application OAuth doivent appartenir **à Guillaume ou à l'association**, pas à une personne qui quitte la salle. On peut transférer le dépôt (GitHub → Settings → Transfer ownership).
- Garder dans un endroit sûr, connu du propriétaire : les accès aux registraires, au compte Cloudflare et au compte GitHub propriétaire.
- **Sans développeur**, il reste possible de modifier tout le contenu via `/admin`. Le site continue de tourner sans aucune intervention.
- **Avec un développeur**, il devient possible de changer la mise en page, d'ajouter des pages ou des types de contenu (fichiers Astro et `public/admin/config.yml`).

## Points à vérifier

- Le montant réel de l'abonnement GoDaddy actuel (sur la facture).
- Les conditions actuelles des offres gratuites de Cloudflare Pages et Workers au moment de la mise en place.
