// Typographie française : espaces insécables là où une ligne ne doit pas se couper
// (« guillemets », avant ? ! ; : et avant €).
const INSECABLE = ' ';
const FINE = ' ';

export function typo(texte) {
  if (!texte) return texte;
  return texte
    .replace(/«\s*/g, `«${INSECABLE}`)
    .replace(/\s*»/g, `${INSECABLE}»`)
    .replace(/ ([?!;])/g, `${FINE}$1`)
    .replace(/ :/g, `${INSECABLE}:`)
    .replace(/ €/g, `${INSECABLE}€`)
    .replace(/(\d) %/g, `$1${INSECABLE}%`);
}

// Plugin remark : applique typo() à tous les textes Markdown.
export function remarqueTypo() {
  const parcourir = (noeud) => {
    if (noeud.type === 'text') noeud.value = typo(noeud.value);
    noeud.children?.forEach(parcourir);
  };
  return (arbre) => parcourir(arbre);
}
