/** Écotourisme & gestion durable — contenu pédagogique Visit Cameroon. */

export type EcoPillar = {
  id: "environment" | "economy" | "social";
  titleFr: string;
  titleEn: string;
  bodyFr: string;
  bodyEn: string;
};

export type EcoPractice = {
  id: string;
  titleFr: string;
  titleEn: string;
  bodyFr: string;
  bodyEn: string;
};

export const ecoIntro = {
  whatFr:
    "L’écotourisme, c’est découvrir la nature et les cultures du Cameroun en laissant le moins de traces possible : parcs, forêts, chutes, villages, guides locaux et petits groupes.",
  whatEn:
    "Ecotourism means discovering Cameroon’s nature and cultures while leaving as little impact as possible: parks, forests, falls, villages, local guides and small groups.",
  manageFr:
    "La gestion durable, c’est organiser ces visites pour qu’elles puissent durer : protéger l’environnement, faire vivre les communautés, et respecter les sites sacrés ou fragiles.",
  manageEn:
    "Sustainable management means organising visits so they can last: protecting the environment, supporting communities, and respecting sacred or fragile sites.",
};

export const ecoPillars: EcoPillar[] = [
  {
    id: "environment",
    titleFr: "Environnement",
    titleEn: "Environment",
    bodyFr:
      "Sentiers balisés, déchets ramenés, pas de braconnage ni de nourrissage de la faune, respect des quotas et des saisons de visite.",
    bodyEn:
      "Marked trails, pack out rubbish, no poaching or wildlife feeding, respect visit quotas and seasons.",
  },
  {
    id: "economy",
    titleFr: "Économie locale",
    titleEn: "Local economy",
    bodyFr:
      "Guides agréés, auberges et artisans du coin, droits d’entrée qui financent les parcs — l’argent reste au Cameroun.",
    bodyEn:
      "Licensed guides, local lodges and craftspeople, park fees that fund conservation — money stays in Cameroon.",
  },
  {
    id: "social",
    titleFr: "Communautés",
    titleEn: "Communities",
    bodyFr:
      "Consentement avant photos, respect des lieux sacrés, pas de folklore forcé : le voyageur est invité, pas propriétaire.",
    bodyEn:
      "Consent before photos, respect for sacred places, no forced folklore: you are a guest, not an owner.",
  },
];

/** Gestes concrets pour le voyageur. */
export const ecoVisitorPractices: EcoPractice[] = [
  {
    id: "guide",
    titleFr: "Prenez un guide local",
    titleEn: "Hire a local guide",
    bodyFr:
      "Dans les parcs (Waza, Korup, Mont Cameroun…), le guide ou pisteur est souvent obligatoire — et c’est mieux pour la sécurité et la conservation.",
    bodyEn:
      "In parks (Waza, Korup, Mount Cameroon…), a guide or tracker is often mandatory — and better for safety and conservation.",
  },
  {
    id: "waste",
    titleFr: "Zéro trace",
    titleEn: "Leave no trace",
    bodyFr:
      "Ramenez vos déchets, évitez le plastique à usage unique, restez sur les sentiers. Les forêts et plages ne sont pas des poubelles.",
    bodyEn:
      "Pack out your waste, avoid single-use plastic, stay on trails. Forests and beaches are not rubbish dumps.",
  },
  {
    id: "wildlife",
    titleFr: "Faune à distance",
    titleEn: "Wildlife at a distance",
    bodyFr:
      "Pas de flash agressif, pas de nourrissage, pas d’achat de produits issus du braconnage (ivoire, peaux, bushmeat illégal).",
    bodyEn:
      "No harsh flash, no feeding, no buying products from poaching (ivory, skins, illegal bushmeat).",
  },
  {
    id: "community",
    titleFr: "Soutenez le local",
    titleEn: "Support local",
    bodyFr:
      "Mangez local, dormez chez l’habitant ou en lodge communautaire, achetez l’artisanat auprès des producteurs — pas des contrefaçons touristiques.",
    bodyEn:
      "Eat local, stay in community lodges, buy crafts from makers — not tourist fakes.",
  },
  {
    id: "fees",
    titleFr: "Payez les droits d’entrée",
    titleEn: "Pay park fees",
    bodyFr:
      "Les tarifs des parcs financent rangers et entretien. Refusez les « raccourcis » non officiels.",
    bodyEn:
      "Park fees fund rangers and upkeep. Refuse unofficial “shortcuts”.",
  },
  {
    id: "season",
    titleFr: "Choisissez la bonne saison",
    titleEn: "Choose the right season",
    bodyFr:
      "Safari au Far North plutôt en saison sèche ; forêts humides : prévoyez pluie et sentiers glissants. Moins de monde = moins de pression.",
    bodyEn:
      "Far North safari works best in the dry season; rainforest trails can be slippery. Fewer visitors means less pressure.",
  },
];

/** Ce que la plateforme met en avant côté gestion durable. */
export const ecoPlatformCommitments: EcoPractice[] = [
  {
    id: "transparent-fees",
    titleFr: "Tarifs indicatifs transparents",
    titleEn: "Transparent indicative fees",
    bodyFr:
      "Nous affichons des fourchettes publiées (parcs, guides) et rappelons de confirmer sur place.",
    bodyEn:
      "We show published fee ranges (parks, guides) and remind you to confirm on site.",
  },
  {
    id: "eco-tags",
    titleFr: "Lieux labellisés éco",
    titleEn: "Eco-tagged places",
    bodyFr:
      "Carte et liste des sites nature, réserves et expériences communautaires pour choisir en connaissance de cause.",
    bodyEn:
      "Map and list of nature sites, reserves and community experiences so you can choose knowingly.",
  },
  {
    id: "ai-responsible",
    titleFr: "Conseils IA responsables",
    titleEn: "Responsible AI tips",
    bodyFr:
      "Le guide IA privilégie les circuits avec guide local, les saisons adaptées et le respect des communautés.",
    bodyEn:
      "The AI guide favours routes with local guides, suitable seasons and respect for communities.",
  },
];
