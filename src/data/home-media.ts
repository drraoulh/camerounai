/** Curated, verified public images for homepage sections (Wikimedia Commons). */

const commons = (file: string, width = 1400) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

export const experienceMedia = {
  famille: commons("Limbe_Wildlife_Centre.jpg"),
  culture: commons("Foumban.jpg"),
  nature: commons("Landscape_of_Mount_Cameroon.jpg"),
  plage: commons("Beach of Kribi, Cameroon.jpg"),
  gastro: commons("Ndolé.jpg"),
  eco: commons("Parc Waza.jpg"),
} as const;

export type EcoHighlight = {
  id: string;
  nameFr: string;
  nameEn: string;
  cityFr: string;
  cityEn: string;
  priceFr: string;
  priceEn: string;
  summaryFr: string;
  summaryEn: string;
  image: string;
  href: string;
  sourceNoteFr: string;
  sourceNoteEn: string;
};

/** Ecotourism picks with published indicative fees (verify on site). */
export const ecoHighlights: EcoHighlight[] = [
  {
    id: "waza",
    nameFr: "Parc national de Waza",
    nameEn: "Waza National Park",
    cityFr: "Extrême-Nord",
    cityEn: "Far North",
    priceFr: "Entrée ~5 000 FCFA / pers. / jour · pisteur 5 000–10 000 FCFA · véhicule ~2 000 FCFA",
    priceEn: "Entry ~5,000 FCFA / person / day · tracker 5,000–10,000 FCFA · vehicle ~2,000 FCFA",
    summaryFr:
      "Safari sahélien : éléphants, antilopes et oiseaux en saison sèche (déc.–avr.). Guide/pisteur obligatoire.",
    summaryEn:
      "Sahelian safari: elephants, antelopes and birds in the dry season (Dec–Apr). Tracker required.",
    image: commons("Parc Waza.jpg"),
    href: "/destinations/waza-park",
    sourceNoteFr: "Tarifs indicatifs (Petit Futé / bureau du parc).",
    sourceNoteEn: "Indicative fees (Petit Futé / park office).",
  },
  {
    id: "korup",
    nameFr: "Parc national de Korup",
    nameEn: "Korup National Park",
    cityFr: "Sud-Ouest · Mundemba",
    cityEn: "South-West · Mundemba",
    priceFr: "Visiteur étranger ~20 USD/jour (~12 000 FCFA) · résident ~5 USD (~3 000 FCFA) · guide obligatoire",
    priceEn: "Foreign visitor ~$20/day (~12,000 FCFA) · resident ~$5 (~3,000 FCFA) · guide required",
    summaryFr:
      "Forêt primaire, pont de Mana et sentiers d’observation. Permis et guide au bureau de Mundemba.",
    summaryEn:
      "Primary rainforest, Mana bridge and wildlife trails. Permits and guides at Mundemba office.",
    image: commons("Korup_National_Park.jpg"),
    href: "/explore/sud-ouest",
    sourceNoteFr: "Tarifs publiés 2024 (korupnationalpark.org / guides voyage).",
    sourceNoteEn: "Published 2024 fees (korupnationalpark.org / travel guides).",
  },
  {
    id: "mont-cameroun",
    nameFr: "Mont Cameroun (parc)",
    nameEn: "Mount Cameroon National Park",
    cityFr: "Buea · Sud-Ouest",
    cityEn: "Buea · South-West",
    priceFr: "Randonnée encadrée souvent 15 000–40 000 FCFA / pers. (entrée + guide, selon formule)",
    priceEn: "Guided hikes often 15,000–40,000 FCFA / person (park + guide, depending on package)",
    summaryFr:
      "Plus haut volcan d’Afrique de l’Ouest. Départ fréquent depuis Buea ; prévoir guide agréé.",
    summaryEn:
      "West Africa’s highest volcano. Common start from Buea; use a licensed guide.",
    image: commons("Landscape_of_Mount_Cameroon.jpg"),
    href: "/destinations/mount-cameroon",
    sourceNoteFr: "Fourchettes opérateurs locaux (vérifier avant départ).",
    sourceNoteEn: "Local operator ranges (confirm before travel).",
  },
  {
    id: "lobe",
    nameFr: "Chutes de la Lobé",
    nameEn: "Lobé Falls",
    cityFr: "Kribi · Sud",
    cityEn: "Kribi · South",
    priceFr: "Accès libre / contribution locale · pirogue / guide souvent 2 000–5 000 FCFA",
    priceEn: "Open access / local contribution · canoe / guide often 2,000–5,000 FCFA",
    summaryFr:
      "Chutes qui se jettent dans l’Atlantique, près de Kribi. Idéal en demi-journée avec guide local.",
    summaryEn:
      "Falls meeting the Atlantic near Kribi. Ideal half-day with a local guide.",
    image: commons("Chutes de la Lobé.jpg"),
    href: "/destinations/lobé-falls",
    sourceNoteFr: "Pratiques locales courantes (variables selon saison).",
    sourceNoteEn: "Common local practice (varies by season).",
  },
  {
    id: "limbe-wildlife",
    nameFr: "Limbe Wildlife Centre",
    nameEn: "Limbe Wildlife Centre",
    cityFr: "Limbé · Sud-Ouest",
    cityEn: "Limbé · South-West",
    priceFr: "Entrée souvent ~2 000–5 000 FCFA (adulte) · soutien conservation",
    priceEn: "Entry often ~2,000–5,000 FCFA (adult) · supports conservation",
    summaryFr:
      "Centre de primatologie et sensibilisation : chimpanzés, drills et programmes éducatifs.",
    summaryEn:
      "Primate rescue and education centre: chimpanzees, drills and learning programmes.",
    image: commons("Limbe_Wildlife_Centre.jpg"),
    href: "/destinations/limbe",
    sourceNoteFr: "Tarifs affichés sur place (à confirmer).",
    sourceNoteEn: "On-site posted fees (confirm locally).",
  },
  {
    id: "kribi-coast",
    nameFr: "Côte de Kribi",
    nameEn: "Kribi coast",
    cityFr: "Kribi · Sud",
    cityEn: "Kribi · South",
    priceFr: "Plage libre · activités (pirogue, guide) 3 000–10 000 FCFA selon prestation",
    priceEn: "Free beach access · activities (canoe, guide) 3,000–10,000 FCFA depending on service",
    summaryFr:
      "Littoral atlantique, fruits de mer et balades au coucher du soleil.",
    summaryEn:
      "Atlantic shoreline, seafood and sunset walks.",
    image: commons("SUNSET AT KRIBI BEACH.jpg"),
    href: "/destinations/kribi-beach",
    sourceNoteFr: "Estimations activités locales.",
    sourceNoteEn: "Local activity estimates.",
  },
];
