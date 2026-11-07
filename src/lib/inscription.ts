// Données partagées entre le formulaire d'inscription (page) et le générateur de PDF.
//
// Les coordonnées sont exprimées en pixels sur les images de référence des modèles :
//   - fiche d'adhésion : l'image PNG elle-même (1414 × 2000 px)
//   - autorisation parentale et règlement intérieur : rendu de la page à 841 px de large
// Si un modèle de src/assets/modeles/ est remplacé, il faut recaler ces coordonnées.

export interface Abonnement {
  id: string;
  libelle: string;
  /** Centre de la case à cocher sur la fiche d'adhésion (px). */
  case: [number, number];
}

// Libellés et prix tels qu'imprimés sur la fiche d'adhésion.
export const ABONNEMENTS: Abonnement[] = [
  { id: 'mt-adulte-annuel', libelle: 'Muay Thai Adulte annuel (550 €)', case: [65, 970] },
  { id: 'mma-adulte-annuel', libelle: 'MMA Adulte annuel (550 €)', case: [65, 1015] },
  { id: 'mt-adulte-semestre', libelle: 'Muay Thai Adulte semestre (430 €)', case: [65, 1060] },
  { id: 'mma-adulte-semestre', libelle: 'MMA Adulte semestre (430 €)', case: [65, 1104] },
  { id: 'mt-ados-kids-annuel', libelle: 'Muay Thai Ados / Kids annuel (410 €)', case: [65, 1149] },
  { id: 'mma-ados-annuel', libelle: 'MMA Ados annuel (410 €)', case: [631, 957] },
  { id: '2d-adulte-annuel', libelle: '2 disciplines (MMA + Muay Thai) Adulte annuel (670 €)', case: [631, 1000] },
  { id: '2d-adulte-semestre', libelle: '2 disciplines (MMA + Muay Thai) Adulte semestre (530 €)', case: [631, 1043] },
  { id: '2d-ados-kids-annuel', libelle: '2 disciplines Ados / Kids annuel (510 €)', case: [631, 1086] },
  { id: 'mt-feminin-annuel', libelle: 'Muay Thai 100 % féminin annuel (410 €)', case: [631, 1132] },
];

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
