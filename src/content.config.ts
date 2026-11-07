// Schéma du contenu du site.
// Chaque fichier modifiable depuis /admin est validé ici au moment du build :
// si une donnée est invalide, le build échoue et la version en ligne reste inchangée.
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

// Fichier YAML contenant un seul objet (ex. site.yaml) → une seule entrée.
const objetUnique = (id: string) => (texte: string) => [{ ...parse(texte), id }];

// Fichier YAML contenant une liste sous une clé (ex. planning.yaml → cours:) → une entrée par élément.
const listeSous = (cle: string) => (texte: string) =>
  ((parse(texte)?.[cle] ?? []) as Record<string, unknown>[]).map((element, i) => ({
    ...element,
    id: String(i + 1),
  }));

export const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
export const SALLES = ['ordener', 'ney'] as const;
export const PUBLICS = ['adultes', 'ados', 'kids', 'feminin'] as const;
export const DISCIPLINES = ['muay-thai', 'mma'] as const;

const heure = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Heure attendue au format HH:MM, par exemple 19:00' });

const salle = z.object({
  nom: z.string().min(1),
  adresse: z.string().min(1),
  code_postal_ville: z.string().min(1),
});

export const collections = {
  textes: defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/textes' }),
    schema: z.object({
      titre: z.string().min(1),
      sous_titre: z.string().optional(),
    }),
  }),

  coachs: defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/coachs' }),
    schema: ({ image }) =>
      z.object({
        nom: z.string().min(1),
        ordre: z.number().int(),
        photo: image(),
      }),
  }),

  planning: defineCollection({
    loader: file('src/data/planning.yaml', { parser: listeSous('cours') }),
    schema: z
      .object({
        jour: z.enum(JOURS),
        debut: heure,
        fin: heure,
        intitule: z.string().min(1),
        disciplines: z.array(z.enum(DISCIPLINES)).min(1),
        public: z.enum(PUBLICS),
        salle: z.enum(SALLES),
      })
      .refine((c) => c.debut < c.fin, { message: "L'heure de fin doit être après l'heure de début" }),
  }),

  site: defineCollection({
    loader: file('src/data/site.yaml', { parser: objetUnique('site') }),
    schema: z.object({
      nom: z.string(),
      accroche: z.string(),
      telephone: z.string(),
      email: z.email(),
      reseaux: z.object({
        facebook: z.url().optional(),
        instagram: z.url().optional(),
        youtube: z.url().optional(),
      }),
      salles: z.object({ ordener: salle, ney: salle }),
    }),
  }),

  accueil: defineCollection({
    loader: file('src/data/accueil.yaml', { parser: objetUnique('accueil') }),
    schema: z.object({
      titre_salles: z.string(),
      titre_atouts: z.string(),
      atouts: z.array(
        z.object({
          titre: z.string(),
          texte: z.string(),
          lien_libelle: z.string(),
          lien: z.string(),
        }),
      ),
    }),
  }),

  tarifs: defineCollection({
    loader: file('src/data/tarifs.yaml', { parser: objetUnique('tarifs') }),
    schema: z.object({
      formules: z.array(
        z.object({
          titre: z.string(),
          detail: z.string().optional(),
          prix: z.array(z.object({ libelle: z.string(), montant: z.number().nonnegative() })).min(1),
        }),
      ),
      paiement: z.string().optional(),
    }),
  }),

  faq: defineCollection({
    loader: file('src/data/faq.yaml', { parser: objetUnique('faq') }),
    schema: z.object({
      questions: z.array(z.object({ question: z.string(), reponse: z.string() })),
    }),
  }),

  documents: defineCollection({
    loader: file('src/data/documents.yaml', { parser: objetUnique('documents') }),
    schema: z.object({
      titre: z.string(),
      documents: z.array(
        z.object({
          titre: z.string(),
          fichier: z.string().startsWith('/documents/', { message: 'Le fichier doit être dans public/documents' }),
        }),
      ),
    }),
  }),
};
