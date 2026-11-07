# Contenu et style du site Kerner Team

Règles éditoriales et visuelles de la refonte. Pour l'hébergement et la mise à jour, voir [INFRA.md](INFRA.md).

## Principe : la voix de Guillaume

- Les textes du site actuel sont **conservés tels quels**. La manière d'écrire de Guillaume fait partie de l'identité de la salle.
- On corrige **uniquement** les fautes de frappe, d'orthographe et d'accord, ainsi que les accents sur les majuscules.
- **Aucune réécriture** : pas de reformulation, de raccourcissement, de « modernisation » ni de ton marketing.
- Quand une phrase est cassée (il manque un morceau), on propose une correction, mais **elle doit être validée par Guillaume** avant la mise en ligne. Voir « Corrections à valider » plus bas.
- On ne retire du texte que s'il vient du modèle GoDaddy et non de Guillaume (newsletter, popup « Annonce », etc.).

## Structure : 4 pages

| Page | Contenu repris du site actuel |
|---|---|
| **Accueil** | Intro « Une école adaptée à vos besoins », les 3 disciplines, les textes de la page « À propos » (« Entraînez-vous comme un champion », « Pourquoi choisir Kerner Team ? »), les 2 salles (photos + lien d'itinéraire), la FAQ |
| **Cours & planning** | Textes de la page « Type de cours » et planning en HTML |
| **L'équipe** | Histoire de Guillaume Kerner (« L'Ange Blond ») et fiches des coachs |
| **Tarifs & inscription** | Grille tarifaire, pièces à fournir, fermetures, documents à télécharger, conditions du cours d'essai |

- **Inscription** (page Tarifs & inscription, section `#inscription`) : en premier choix, un dépliant « Remplir mon dossier en ligne » (`#dossier`) qui génère le dossier en PDF à partir des documents originaux ; en second choix, un dépliant plus discret pour télécharger les documents vierges (`#documents`). Les textes d'aide du formulaire sont des textes d'interface, pas des textes de Guillaume.
- **Type d'abonnement par étapes** : catégorie (Adulte / Ados – Kids, pré-sélectionnée d'après la date de naissance), puis discipline (Muay Thai, MMA, les deux, ou 100 % féminin pour les adultes), puis durée (annuel ou semestre, adultes uniquement).
- **Ordre des cours** : Muay Thai, MMA, Muay Thai kids / ados, Muay Thai féminin, chacun avec son icône (`src/components/IconeCours.astro`).
- **Coachs sans photo ni présentation** (Jean, Phil) : la fiche affiche « Photo à venir » et « Présentation à venir » jusqu'à ce qu'on les complète dans `/admin`.
- **Pied de page commun** à toutes les pages : adresses des 2 salles, téléphone, e-mail, réseaux sociaux (Facebook, Instagram, YouTube). Il n'y a donc pas de page Contact.
- La page « À propos » disparaît, mais **tout son texte est repris** sur l'accueil.

## Images

### Règles

1. **Uniquement des images liées à la Kerner Team** : ses salles, Guillaume, ses coachs, son logo. **Aucune image de banque d'images.**
2. **Pas de photo de groupe** ni de photo où des élèves sont reconnaissables : on ne sait pas qui a donné son accord. **Aucun mineur reconnaissable**, dans aucun cas.
3. Les portraits des coachs sont autorisés, puisqu'ils figurent déjà sur le site actuel.
4. **Photos Google Maps** : chaque photo appartient à la personne qui l'a publiée. On ne réutilise que celles publiées par le compte propriétaire (la Kerner Team), ou celles dont l'auteur a donné son accord. Sinon, on demande les originaux à Guillaume ou on prend nos propres photos (salle vide).
5. Toujours attribuer la bonne salle à chaque photo (voir ci-dessous).

### Les salles

| Salle | Caractéristiques visuelles | Photos disponibles |
|---|---|---|
| **21 rue Ordener** | Tatamis noirs au sol et aux murs, logos KT sur les murs, sacs de frappe, cage, baies vitrées | Les 3 photos du site actuel (`blob-8680243`, `blob-9df1677`, `blob-a91d1d0`) |
| **101 boulevard Ney** | Salle avec un ring de boxe (salles de sport municipales Ney) | Aucune pour l'instant. À trouver (voir la règle 4). Dans le site témoin : un emplacement « photo à venir » |

### Recherche en ligne (novembre 2026)

- **Salle Ney** : aucune photo trouvée dans les résultats web. La photo de ring sur la fiche Paris.fr de l'activité Kerner Team est une illustration générique de la Ville, non identifiée comme la salle Ney : ne pas l'utiliser. Les photos Google Maps ne sont pas accessibles automatiquement : à récupérer à la main.
- **Portrait de Guillaume** : la meilleure source trouvée est un fond d'écran d'archives (portrait sépia et photos de combats) publié sur thescienceof8limbs.com, en 400 × 300 px. Le bandeau actuel du site (`banniere2-1.jpg`) en est un recadrage. Pas de version en meilleure résolution trouvée.

### Site témoin

La première version sert de maquette à montrer à Guillaume, sans engagement. Les images manquantes y sont remplacées par des emplacements explicites (« photo à venir »), jamais par des images de banque ni par des photos d'une autre salle.

### Images conservées

- Logo KT (rouge sur noir).
- Les 3 photos de la salle Ordener.
- Le bandeau de photos d'archives de Guillaume en combat (`banniere2-1.jpg`), pour la page Équipe.
- Le portrait de Guillaume (`download.jpg`). Il est en très basse résolution (183 × 275 px) : en demander une meilleure version.
- Les portraits des coachs.

### Images supprimées

- Le boxeur gants levés en noir et blanc (`blob-f5d9be3.png`), image de banque présente sur toutes les pages.
- Les photos Unsplash de Logan Weaver (`logan-weaver-…-unsplash.jpg`, ×2).
- L'enfant boxeur (`young-hardworking-boxer-learning-box-child-spo.jpg`), image de banque.

## Éléments supprimés (hérités de GoDaddy)

- La popup « Annonce – Bienvenue ! Consultez mes nouvelles annonces ».
- L'inscription à la newsletter (« offres spéciales, soldes »).
- Le widget « Avis de nos élèves ».
- Le widget de messagerie, remplacé par des liens `tel:` / `mailto:` (et WhatsApp si Guillaume le souhaite).
- La bannière cookies. Le site n'utilise aucun cookie, donc elle n'a pas lieu d'être.

## Identité visuelle

- **Couleurs** : noir et rouge, tirées du logo KT. Le texte est clair sur fond sombre.
- **Fond d'écran** : `src/assets/images/background.png`, deux coqs de combat et des motifs végétaux en rouge sombre, sur fond transparent.
  - Il est placé en arrière-plan fixe, derrière le contenu, sur fond noir.
  - On l'atténue (opacité réduite ou voile sombre) pour que le texte reste lisible partout, avec un contraste minimum WCAG AA (4,5:1 pour le texte courant).
  - L'image est compressée pour le web : l'original fait 1,1 Mo en PNG, l'objectif est une version WebP bien plus légère.
- **Titres** : en majuscules, dans l'esprit actuel (affiche de combat).

## Sobriété technique (impact visible)

- **Aucun service tiers intégré** dans les pages. Pas d'iframe Google Maps : on met un simple lien « Itinéraire » vers Google Maps ou OpenStreetMap. Pas de vidéo YouTube intégrée : un lien vers la chaîne.
- **Polices hébergées sur le site**, pas chargées depuis Google Fonts.
- Pour des statistiques de visite, uniquement Cloudflare Web Analytics, qui fonctionne sans cookie.

## Corrections du texte

### Fautes simples (appliquées directement)

| Avant | Après | Page |
|---|---|---|
| PlEIN | PLEIN | Accueil |
| TOUTES NIVEAU | TOUS NIVEAUX | À propos |
| diplomés | diplômés | À propos |
| encadré par | encadrés par | À propos |
| Bénéficier de l'excellence | Bénéficiez de l'excellence | À propos |
| deux condition | trois conditions | FAQ |
| est-ce que que | est-ce que | FAQ |
| 20 euro | 20 euros | FAQ |
| mma | MMA | FAQ |
| en grappling | En grappling | FAQ |
| kid's | kids | Type de cours, Équipe |
| formé a la | formé à la | Équipe |
| AlLISON SIDHARTA | ALISON SIDHARTA | Équipe |
| L'Ange Blond » | « L'Ange Blond » | Équipe |
| SEANCE D'ESSAI 20 | SÉANCE D'ESSAI 20 € | Tarifs |
| SEANCE, ANNEE | SÉANCE, ANNÉE | Tarifs |
| AOUT | AOÛT | Inscription |
| FICHE D'ADHESION | FICHE D'ADHÉSION | Inscription |
| REGLEMENT INTERIEUR | RÈGLEMENT INTÉRIEUR | Inscription |
| Kerner Team: Training Fees for MMA & Muay Thai Classes (titre de page) | Tarifs & inscription – Kerner Team | Tarifs |
| bien être | bien-être | À propos |
| FEMININ (titres) | FÉMININ | Type de cours, Tarifs, planning |
| Points finaux manquants (« …adultes et ados . », « …à votre rythme », « …pieds-poings ») | Point ajouté ou espace retirée | Accueil, Type de cours |
| Guillemets droits autour de "Ange Blond" dans l'accroche | « Ange Blond » | Accueil |

### Bugs de mise en page (disparaissent avec la refonte)

- Les adresses en double sur l'accueil (bd Ney ×5, Ordener ×1).
- Le nom « Alison Sidharta » répété sous les fiches de Khavaj et de Julien.
- Le titre « MUAY THAI KIDS / ADOS » placé au-dessus du texte du cours 100 % féminin.

### Planning

- Grand écran : calendrier avec axe horaire ; chaque cours est placé à sa hauteur réelle, les cours simultanés côte à côte, les heures sans cours repliées.
- Petit écran : un onglet par jour, ouvert sur le jour courant.
- Horaires au format court : « 7h », « 12h30 ».
- La salle est toujours écrite en toutes lettres sur le cours, en plus de la couleur (rouge = boulevard Ney).

### Typographie automatique

Les espaces insécables du français (avant `? ! ; :`, à l'intérieur des « guillemets », avant `€` et `%`) sont ajoutées automatiquement à l'affichage par `src/lib/typo.mjs`. Inutile de les saisir dans `/admin`.
- Les sections vides de l'accueil (« Notre équipe », « Planning »).

### Corrections à valider par Guillaume

| Texte actuel | Proposition |
|---|---|
| « Que vous aspirez au plus au niveau a vous defendre. » | « Que vous aspiriez au plus haut niveau ou à vous défendre. » |
| « …deux fois par semaine qualifiés mettent l'accent… » | « …deux fois par semaine. Nos coachs qualifiés mettent l'accent… » |
| La FAQ pose deux fois la question de l'accès à tous les cours avec l'adhésion | N'en garder qu'une |

### Incohérence de contenu à signaler (sans y toucher)

- Le texte « Kids / Ados » annonce du MMA pour les ados, mais le planning ne contient que du Muay Thai ados.

## Questions ouvertes

- Des photos de la salle du boulevard Ney (originaux de Guillaume, photos Google Maps du propriétaire, ou à prendre).
- Une version en meilleure résolution du portrait de Guillaume.
- Les originaux des documents à télécharger (autorisation parentale, fiche d'adhésion, règlement intérieur), si possible en PDF. La fiche d'adhésion est actuellement un PNG.
- Un bouton WhatsApp : oui ou non ?
