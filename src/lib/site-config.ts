// Informations publiques de la vitrine, centralisées ici pour que le header,
// le footer et les pages légales restent cohérents entre eux.
//
// À CONFIRMER par le porteur du projet avant la mise en production : l'adresse
// de contact et les URL des réseaux sociaux ci-dessous suivent le nom de domaine
// prévu par le CDC (dps.bj) mais n'ont pas été fournis explicitement.
export const SITE = {
  nom: "DSP",
  nomComplet: "Dispositif de Sécurité des Patients",
  pays: "République du Bénin",
  emailContact: "contact@dps.bj",
  // Date de dernière mise à jour des documents légaux (CGU, confidentialité).
  majDocumentsLegaux: "28 septembre 2026",
} as const;

export type ReseauSocial = "facebook" | "linkedin" | "x" | "instagram" | "youtube";

export const RESEAUX_SOCIAUX: { reseau: ReseauSocial; label: string; href: string }[] = [
  { reseau: "facebook", label: "Facebook", href: "https://www.facebook.com/dps.bj" },
  { reseau: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/dps-bj" },
  { reseau: "x", label: "X", href: "https://x.com/dps_bj" },
  { reseau: "instagram", label: "Instagram", href: "https://www.instagram.com/dps.bj" },
  { reseau: "youtube", label: "YouTube", href: "https://www.youtube.com/@dps-bj" },
];

// Photographies de la vitrine : toutes issues de Wikimedia Commons, sous
// licence libre. L'attribution est obligatoire (CC BY-SA), elle est affichée
// dans la section "Crédits photographiques" des conditions d'utilisation.
export const PHOTOS = {
  medecin: {
    src: "/images/vitrine/medecin-blouse-blanche.jpg",
    alt: "Jeune médecin en blouse blanche",
    largeur: 1280,
    hauteur: 1918,
    auteur: "Freed Armel",
    licence: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Jeune_m%C3%A9decin_en_blousse_blanche.jpg",
  },
  sageFemme: {
    src: "/images/vitrine/sage-femme-maternite-lagune-cotonou.jpg",
    alt: "Sage-femme prodiguant des soins à un nouveau-né, maternité de la Lagune, Cotonou",
    largeur: 1920,
    hauteur: 1256,
    auteur: "Ji-Elle",
    licence: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Cotonou-Maternit%C3%A9_de_la_Lagune_(2).jpg",
  },
  cnhu: {
    src: "/images/vitrine/cnhu-hkm-cotonou.jpg",
    alt: "Entrée du Centre National Hospitalier Universitaire Hubert Koutoukou Maga, Cotonou",
    largeur: 1920,
    hauteur: 1440,
    auteur: "Alex Ahdn",
    licence: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Centre_National_hospitalier_Universitaire_Hubert_Koutoukou_MAGA_01.jpg",
  },
  centreSante: {
    src: "/images/vitrine/centre-sante-agame.jpg",
    alt: "Centre de santé d'Agamè, commune de Lokossa, Mono-Couffo",
    largeur: 1920,
    hauteur: 1280,
    auteur: "Adoscam",
    licence: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Centre_de_sant%C3%A9_d%27Agam%C3%A8_au_B%C3%A9nin_03_(cropped).jpg",
  },
} as const;
