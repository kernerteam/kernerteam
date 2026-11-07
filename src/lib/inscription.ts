// Données partagées entre le formulaire d'inscription (page) et le générateur de PDF.
//
// Les coordonnées sont exprimées en pixels sur les images de référence des modèles :
//   - fiche d'adhésion : l'image PNG elle-même (1414 × 2000 px)
//   - autorisation parentale et règlement intérieur : rendu de la page à 841 px de large
// Si un modèle de src/assets/modeles/ est remplacé, il faut recaler ces coordonnées.

export type Categorie = 'adulte' | 'jeune';
export type Discipline = 'muay-thai' | 'mma' | 'deux' | 'feminin';
export type Duree = 'annuel' | 'semestre';

export interface Abonnement {
  id: string;
  categorie: Categorie;
  discipline: Discipline;
  duree: Duree;
  libelle: string;
  prix: number;
  /** Centre de la case à cocher sur la fiche d'adhésion (px). */
  case: [number, number];
}

// Formules et prix tels qu'imprimés sur la fiche d'adhésion.
export const ABONNEMENTS: Abonnement[] = [
  { id: 'mt-adulte-annuel', categorie: 'adulte', discipline: 'muay-thai', duree: 'annuel', libelle: 'Muay Thai Adulte annuel', prix: 550, case: [65, 970] },
  { id: 'mt-adulte-semestre', categorie: 'adulte', discipline: 'muay-thai', duree: 'semestre', libelle: 'Muay Thai Adulte semestre', prix: 430, case: [65, 1060] },
  { id: 'mma-adulte-annuel', categorie: 'adulte', discipline: 'mma', duree: 'annuel', libelle: 'MMA Adulte annuel', prix: 550, case: [65, 1015] },
  { id: 'mma-adulte-semestre', categorie: 'adulte', discipline: 'mma', duree: 'semestre', libelle: 'MMA Adulte semestre', prix: 430, case: [65, 1104] },
  { id: '2d-adulte-annuel', categorie: 'adulte', discipline: 'deux', duree: 'annuel', libelle: '2 disciplines (MMA + Muay Thai) Adulte annuel', prix: 670, case: [631, 1000] },
  { id: '2d-adulte-semestre', categorie: 'adulte', discipline: 'deux', duree: 'semestre', libelle: '2 disciplines (MMA + Muay Thai) Adulte semestre', prix: 530, case: [631, 1043] },
  { id: 'mt-feminin-annuel', categorie: 'adulte', discipline: 'feminin', duree: 'annuel', libelle: 'Muay Thai 100 % féminin annuel', prix: 410, case: [631, 1132] },
  { id: 'mt-ados-kids-annuel', categorie: 'jeune', discipline: 'muay-thai', duree: 'annuel', libelle: 'Muay Thai Ados / Kids annuel', prix: 410, case: [65, 1149] },
  { id: 'mma-ados-annuel', categorie: 'jeune', discipline: 'mma', duree: 'annuel', libelle: 'MMA Ados annuel', prix: 410, case: [631, 957] },
  { id: '2d-ados-kids-annuel', categorie: 'jeune', discipline: 'deux', duree: 'annuel', libelle: '2 disciplines Ados / Kids annuel', prix: 510, case: [631, 1086] },
];

export const LIBELLES_CATEGORIES: Record<Categorie, string> = {
  adulte: 'Adulte',
  jeune: 'Ados / Kids (moins de 18 ans)',
};
export const LIBELLES_DISCIPLINES: Record<Discipline, string> = {
  'muay-thai': 'Muay Thai',
  mma: 'MMA',
  deux: '2 disciplines : Muay Thai + MMA',
  feminin: 'Muay Thai 100 % féminin',
};
export const LIBELLES_DUREES: Record<Duree, string> = { annuel: 'Annuel', semestre: 'Semestre' };

export type Qualite = 'pere' | 'mere' | 'tuteur';

export interface Dossier {
  nom: string;
  prenom: string;
  naissance: string; // AAAA-MM-JJ
  lieuNaissance: string;
  sexe: 'H' | 'F' | '';
  telephone: string;
  email: string;
  passSport: string;
  adresse: string;
  codePostal: string;
  ville: string;
  urgence: string;
  abonnement: string;
  mineur: boolean;
  responsable: {
    nom: string;
    qualite: Qualite;
    adresse: string;
    codePostal: string;
    ville: string;
    telephone: string;
  };
  faitA: string;
  date: Date;
  refusImage: boolean;
  signature?: Uint8Array; // PNG
  photo?: Uint8Array; // PNG détourée en cercle
}

/** Âge en années révolues à une date donnée. */
export function age(naissance: string, le: Date): number {
  const [a, m, j] = naissance.split('-').map(Number);
  let ans = le.getFullYear() - a;
  if (le.getMonth() + 1 < m || (le.getMonth() + 1 === m && le.getDate() < j)) ans--;
  return ans;
}

export const dateFr = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

export const isoVersFr = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '');
