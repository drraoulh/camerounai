import { experienceMedia } from "./home-media";

export type MegaLink = {
  href: string;
  labelFr: string;
  labelEn: string;
  tagFr: string;
  tagEn: string;
};

export type MegaFeature = {
  href: string;
  titleFr: string;
  titleEn: string;
  bodyFr: string;
  bodyEn: string;
  image: string;
  ctaFr: string;
  ctaEn: string;
};

export type MegaSection = {
  id: string;
  href: string;
  labelFr: string;
  labelEn: string;
  /** Short label for the top nav bar */
  navFr: string;
  navEn: string;
  links: MegaLink[];
  feature: MegaFeature;
};

export const megaNav: MegaSection[] = [
  {
    id: "explore",
    href: "/explore",
    labelFr: "Explorer le Cameroun",
    labelEn: "Explore Cameroon",
    navFr: "Explorer",
    navEn: "Explore",
    links: [
      {
        href: "/about",
        labelFr: "À propos du Cameroun",
        labelEn: "About Cameroon",
        tagFr: "Pays, climats, peuples",
        tagEn: "Country, climates, peoples",
      },
      {
        href: "/map",
        labelFr: "Carte interactive",
        labelEn: "Interactive map",
        tagFr: "Sites, régions, proximité",
        tagEn: "Sites, regions, nearby",
      },
      {
        href: "/explore",
        labelFr: "10 régions",
        labelEn: "10 regions",
        tagFr: "Du Sahel à la côte",
        tagEn: "From Sahel to coast",
      },
      {
        href: "/culture",
        labelFr: "Cultures locales",
        labelEn: "Local cultures",
        tagFr: "Grassfields, Sawa, Fang-Beti…",
        tagEn: "Grassfields, Sawa, Fang-Beti…",
      },
      {
        href: "/eco",
        labelFr: "Écotourisme",
        labelEn: "Ecotourism",
        tagFr: "Parcs & tourisme responsable",
        tagEn: "Parks & responsible travel",
      },
      {
        href: "/near-me",
        labelFr: "Près de moi",
        labelEn: "Near me",
        tagFr: "Restaurants & activités",
        tagEn: "Restaurants & activities",
      },
      {
        href: "/learn",
        labelFr: "Learn Cameroon",
        labelEn: "Learn Cameroon",
        tagFr: "Expressions utiles",
        tagEn: "Useful phrases",
      },
      {
        href: "/games",
        labelFr: "Jeux d’apprentissage",
        labelEn: "Learning games",
        tagFr: "Langues ou culture — à vous de choisir",
        tagEn: "Language or culture — you choose",
      },
    ],
    feature: {
      href: "/assistant",
      titleFr: "Rencontrez nos curateurs IA",
      titleEn: "Meet our AI curators",
      bodyFr:
        "Posez une question, parlez à voix haute : l’assistant compose un parcours camerounais sur mesure.",
      bodyEn:
        "Ask a question or speak aloud — the assistant builds a tailored Cameroon itinerary.",
      image: experienceMedia.culture,
      ctaFr: "Ouvrir l’assistant",
      ctaEn: "Open assistant",
    },
  },
  {
    id: "things",
    href: "/things-to-do",
    labelFr: "À faire",
    labelEn: "Things to do",
    navFr: "À faire",
    navEn: "Things to do",
    links: [
      {
        href: "/culture",
        labelFr: "Arts & culture",
        labelEn: "Arts & culture",
        tagFr: "Musées, chefferies, artisanat",
        tagEn: "Museums, chiefdoms, crafts",
      },
      {
        href: "/things-to-do",
        labelFr: "Expériences",
        labelEn: "Experiences",
        tagFr: "Nature, aventure, familles",
        tagEn: "Nature, adventure, families",
      },
      {
        href: "/eat",
        labelFr: "Food & drink",
        labelEn: "Food & drink",
        tagFr: "Saveurs locales",
        tagEn: "Local flavours",
      },
      {
        href: "/eco",
        labelFr: "Nature & wellness",
        labelEn: "Nature & wellness",
        tagFr: "Parcs, cascades, montagne",
        tagEn: "Parks, falls, mountains",
      },
      {
        href: "/vision",
        labelFr: "Nouveau & tendance",
        labelEn: "New & trending",
        tagFr: "Vision IA des monuments",
        tagEn: "AI monument vision",
      },
      {
        href: "/trip",
        labelFr: "Itinéraires",
        labelEn: "Itineraries",
        tagFr: "Budget intelligent",
        tagEn: "Smart budget trips",
      },
    ],
    feature: {
      href: "/things-to-do",
      titleFr: "99 choses à faire au Cameroun",
      titleEn: "99 things to do in Cameroon",
      bodyFr:
        "Des plages de Kribi aux chefferies de l’Ouest : une sélection pour tous les voyageurs.",
      bodyEn:
        "From Kribi beaches to Western chiefdoms — a selection for every traveller.",
      image: experienceMedia.nature,
      ctaFr: "Découvrir",
      ctaEn: "Explore",
    },
  },
  {
    id: "eat",
    href: "/eat",
    labelFr: "Manger & boire",
    labelEn: "Eat & drink",
    navFr: "Manger",
    navEn: "Eat & drink",
    links: [
      {
        href: "/eat",
        labelFr: "Tables à découvrir",
        labelEn: "Restaurants to try",
        tagFr: "Ndolé, poulet DG, poisson",
        tagEn: "Ndolé, poulet DG, grilled fish",
      },
      {
        href: "/eat",
        labelFr: "Expériences foodie",
        labelEn: "Foodie experiences",
        tagFr: "Marchés & street food",
        tagEn: "Markets & street food",
      },
      {
        href: "/near-me",
        labelFr: "Près de vous",
        labelEn: "Near you",
        tagFr: "Selon votre position",
        tagEn: "Based on your location",
      },
      {
        href: "/culture",
        labelFr: "Cuisine des régions",
        labelEn: "Regional cuisine",
        tagFr: "Sawa, Grassfields, Sahel…",
        tagEn: "Sawa, Grassfields, Sahel…",
      },
    ],
    feature: {
      href: "/eat",
      titleFr: "Cuisine camerounaise",
      titleEn: "Cameroonian cuisine",
      bodyFr:
        "Un voyage par les assiettes : du Littoral au Nord, les saveurs qui racontent le pays.",
      bodyEn:
        "A journey through the plate — from the Littoral to the North, flavours that tell the country.",
      image: experienceMedia.gastro,
      ctaFr: "Voir les adresses",
      ctaEn: "See places",
    },
  },
  {
    id: "events",
    href: "/events",
    labelFr: "Événements & festivals",
    labelEn: "Events & festivals",
    navFr: "Événements",
    navEn: "Events",
    links: [
      {
        href: "/events",
        labelFr: "Calendrier",
        labelEn: "Cameroon calendar",
        tagFr: "Festivals & temps forts",
        tagEn: "Festivals & highlights",
      },
      {
        href: "/events",
        labelFr: "Famille",
        labelEn: "Family events",
        tagFr: "Sorties pour tous",
        tagEn: "Outings for everyone",
      },
      {
        href: "/events",
        labelFr: "Culture & spectacles",
        labelEn: "Culture & shows",
        tagFr: "Musique, danse, arts",
        tagEn: "Music, dance, arts",
      },
      {
        href: "/events",
        labelFr: "Sport & nature",
        labelEn: "Sports & outdoors",
        tagFr: "Courses, treks, safari",
        tagEn: "Races, treks, safari",
      },
    ],
    feature: {
      href: "/events",
      titleFr: "Festivals à ne pas manquer",
      titleEn: "Festivals not to miss",
      bodyFr:
        "Ngondo, Foumban et bien d’autres rendez-vous culturels à placer dans votre séjour.",
      bodyEn:
        "Ngondo, Foumban and more cultural dates to weave into your stay.",
      image: experienceMedia.famille,
      ctaFr: "Voir le calendrier",
      ctaEn: "View calendar",
    },
  },
  {
    id: "plan",
    href: "/trip",
    labelFr: "Planifier le voyage",
    labelEn: "Plan your trip",
    navFr: "Planifier",
    navEn: "Plan",
    links: [
      {
        href: "/travel-tips",
        labelFr: "Essentiels",
        labelEn: "Essentials",
        tagFr: "Visa, santé, sécurité",
        tagEn: "Visa, health, safety",
      },
      {
        href: "/travel-tips",
        labelFr: "Se déplacer",
        labelEn: "Getting around",
        tagFr: "Vols, routes, villes",
        tagEn: "Flights, roads, cities",
      },
      {
        href: "/stay",
        labelFr: "Hôtels & hébergements",
        labelEn: "Hotels & stays",
        tagFr: "40 adresses Ayila’a",
        tagEn: "40 Ayila’a stays",
      },
      {
        href: "/trip",
        labelFr: "Hébergement & budget",
        labelEn: "Stay & budget",
        tagFr: "Itinéraire intelligent",
        tagEn: "Smart itinerary",
      },
      {
        href: "/map",
        labelFr: "Carte & accessibilité",
        labelEn: "Map & access",
        tagFr: "Points d’intérêt",
        tagEn: "Points of interest",
      },
      {
        href: "/assistant",
        labelFr: "Assistant IA",
        labelEn: "AI assistant",
        tagFr: "Texte + voix FR/EN",
        tagEn: "Text + voice FR/EN",
      },
      {
        href: "/favorites",
        labelFr: "Top Picks",
        labelEn: "Top Picks",
        tagFr: "Vos favoris",
        tagEn: "Your favourites",
      },
    ],
    feature: {
      href: "/trip",
      titleFr: "Composez votre séjour 2026",
      titleEn: "Build your 2026 trip",
      bodyFr:
        "Durée, budget FCFA, centres d’intérêt — l’itinéraire se recalcule avec vous.",
      bodyEn:
        "Duration, FCFA budget, interests — the itinerary recalculates with you.",
      image: experienceMedia.plage,
      ctaFr: "Démarrer",
      ctaEn: "Start now",
    },
  },
];
