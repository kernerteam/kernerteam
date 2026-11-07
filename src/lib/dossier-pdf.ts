// Génère le dossier d'inscription en PDF, dans le navigateur, à partir des documents
// originaux de la Kerner Team (src/assets/modeles/). Aucune donnée n'est envoyée.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from 'pdf-lib';
import { ABONNEMENTS, dateFr, isoVersFr, type Dossier } from './inscription';

export interface Modeles {
  fiche: string; // URL du PNG de la fiche d'adhésion
  autorisation: string; // URL du PDF
  reglement: string; // URL du PDF
}

const ENCRE = rgb(0.07, 0.07, 0.18);

/** Convertit des coordonnées en pixels (image de référence) en points PDF. */
function repere(page: PDFPage, largeurReference: number) {
  // La zone visible (CropBox) ne commence pas toujours en (0, 0) : le règlement intérieur
  // a par exemple une origine à y = 7,83 pt.
  const { x: x0, y: y0, width, height } = page.getCropBox();
  const k = width / largeurReference;
  return { k, x: (px: number) => x0 + px * k, y: (py: number) => y0 + height - py * k };
}

/** Retire les caractères que la police standard ne sait pas encoder (emoji, etc.). */
function nettoyer(police: PDFFont, texte: string): string {
  const normalise = texte.normalize('NFC').replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
  return [...normalise]
    .filter((c) => {
      try {
        police.encodeText(c);
        return true;
      } catch {
        return false;
      }
    })
    .join('');
}

type Repere = ReturnType<typeof repere>;

function ecrire(page: PDFPage, r: Repere, police: PDFFont, texte: string, x: number, y: number, largeurMax: number, taille = 11) {
  const t = nettoyer(police, texte);
  if (!t) return;
  let corps = taille;
  while (corps > 6 && police.widthOfTextAtSize(t, corps) > largeurMax * r.k) corps -= 0.5;
  page.drawText(t, { x: r.x(x), y: r.y(y), size: corps, font: police, color: ENCRE });
}

function cocher(page: PDFPage, r: Repere, police: PDFFont, [cx, cy]: [number, number]) {
  const taille = 13;
  const largeur = police.widthOfTextAtSize('X', taille);
  const hauteur = police.heightAtSize(taille, { descender: false });
  page.drawText('X', { x: r.x(cx) - largeur / 2, y: r.y(cy) - hauteur / 2, size: taille, font: police, color: ENCRE });
}

/** Place une image dans un cadre (px), centrée, sans la déformer. */
function placer(page: PDFPage, r: Repere, image: PDFImage, [x1, y1, x2, y2]: [number, number, number, number]) {
  const largeur = (x2 - x1) * r.k;
  const hauteur = (y2 - y1) * r.k;
  const echelle = Math.min(largeur / image.width, hauteur / image.height);
  const l = image.width * echelle;
  const h = image.height * echelle;
  page.drawImage(image, { x: r.x(x1) + (largeur - l) / 2, y: r.y(y2) + (hauteur - h) / 2, width: l, height: h });
}

async function telecharger(url: string) {
  const reponse = await fetch(url);
  if (!reponse.ok) throw new Error(`Modèle introuvable : ${url}`);
  return new Uint8Array(await reponse.arrayBuffer());
}

export async function genererDossier(d: Dossier, modeles: Modeles): Promise<Uint8Array> {
  const [fichePng, autorisationPdf, reglementPdf] = await Promise.all([
    telecharger(modeles.fiche),
    d.mineur ? telecharger(modeles.autorisation) : Promise.resolve(null),
    telecharger(modeles.reglement),
  ]);

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Dossier d'inscription Kerner Team – ${d.prenom} ${d.nom}`);
  pdf.setAuthor(`${d.prenom} ${d.nom}`);
  pdf.setCreator('kernerteam.net');

  const police = await pdf.embedFont(StandardFonts.Helvetica);
  const gras = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italique = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const signature = d.signature ? await pdf.embedPng(d.signature) : null;
  const dateDuJour = dateFr(d.date);

  // ---------------------------------------------------------------- Fiche d'adhésion
  {
    const fond = await pdf.embedPng(fichePng);
    const page = pdf.addPage([595.28, 841.89]);
    page.drawImage(fond, { x: 0, y: 0, width: 595.28, height: 841.89 });
    const r = repere(page, 1414);

    ecrire(page, r, police, d.nom.toUpperCase(), 168, 466, 670);
    ecrire(page, r, police, d.prenom, 168, 581, 670);
    ecrire(page, r, police, isoVersFr(d.naissance), 945, 533, 270);
    if (d.sexe === 'H') cocher(page, r, gras, [270, 673]);
    if (d.sexe === 'F') cocher(page, r, gras, [363, 673]);
    ecrire(page, r, police, d.email, 728, 698, 480);
    ecrire(page, r, police, d.telephone, 200, 802, 440);
    ecrire(page, r, police, d.passSport, 752, 802, 440);

    const abonnement = ABONNEMENTS.find((a) => a.id === d.abonnement);
    if (abonnement) cocher(page, r, gras, abonnement.case);

    ecrire(page, r, police, d.adresse, 330, 1258, 1010);
    ecrire(page, r, police, d.ville, 330, 1331, 300);
    ecrire(page, r, police, d.codePostal, 330, 1406, 230);
    ecrire(page, r, police, d.urgence, 125, 1556, 1010);
    ecrire(page, r, police, dateDuJour, 392, 1840, 300, 12);

    if (signature) placer(page, r, signature, [770, 1775, 1350, 1905]);
    if (d.photo) placer(page, r, await pdf.embedPng(d.photo), [1112, 110, 1378, 376]);
  }

  // ---------------------------------------------------------------- Autorisation parentale (mineurs)
  if (d.mineur && autorisationPdf) {
    const source = await PDFDocument.load(autorisationPdf);
    const [page] = await pdf.copyPages(source, [0]);
    pdf.addPage(page);
    const r = repere(page, 841);
    const resp = d.responsable;

    ecrire(page, r, police, resp.nom, 192, 420, 355);
    const qualites = { pere: [567, 20], mere: [606, 21], tuteur: [663, 35] } as const;
    const [cx, rx] = qualites[resp.qualite];
    page.drawEllipse({ x: r.x(cx), y: r.y(415), xScale: rx * r.k, yScale: 12 * r.k, borderColor: ENCRE, borderWidth: 1.2 });

    ecrire(page, r, police, resp.adresse, 182, 452, 510);
    ecrire(page, r, police, `${resp.codePostal} ${resp.ville}`, 182, 490, 510);
    ecrire(page, r, police, resp.telephone, 114, 525, 265);
    ecrire(page, r, police, d.nom.toUpperCase(), 130, 670, 245);
    ecrire(page, r, police, d.prenom, 450, 670, 230);
    ecrire(page, r, police, isoVersFr(d.naissance), 164, 708, 220);
    ecrire(page, r, police, d.lieuNaissance, 400, 708, 280);
    ecrire(page, r, police, dateDuJour, 194, 779, 200);
    if (signature) placer(page, r, signature, [300, 910, 540, 1020]);
  }

  // ---------------------------------------------------------------- Règlement intérieur
  {
    const source = await PDFDocument.load(reglementPdf);
    const pages = await pdf.copyPages(source, source.getPageIndices());
    pages.forEach((p) => pdf.addPage(p));
    const page = pages[1];
    const r = repere(page, 841);

    ecrire(page, r, police, d.nom.toUpperCase(), 106, 733, 220);
    ecrire(page, r, police, d.prenom, 396, 733, 300);
    ecrire(page, r, police, dateDuJour, 92, 886, 65, 10);
    ecrire(page, r, police, d.faitA, 184, 886, 250);
    ecrire(page, r, italique, 'Lu et approuvé', 63, 1012, 300, 12);
    if (signature) placer(page, r, signature, [63, 1022, 343, 1112]);
    if (d.mineur) {
      ecrire(page, r, police, `Signature du responsable légal : ${d.responsable.nom}`, 63, 1135, 700, 9);
    }
    if (d.refusImage) {
      ecrire(page, r, gras, "Article 6 – Je refuse la diffusion des photos me concernant (ou concernant mon enfant).", 63, 1160, 760, 10);
    }
  }

  return pdf.save();
}
