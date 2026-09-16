export type RegionCard = {
  id: string;
  /** Matches Supabase regions.slug */
  slug: string;
  nameFr: string;
  nameEn: string;
  taglineFr: string;
  taglineEn: string;
  /** Short narrative for the region page */
  storyFr: string;
  storyEn: string;
  /** Curated “things to visit” for the UX journey */
  toVisitFr: string[];
  toVisitEn: string[];
  /** Representative photo */
  image: string;
  imageCredit: string;
  href: string;
  culturalZone: "Grassfields" | "Sawa" | "Fang-Beti" | "Sudano-Sahelian";
  cityKeys: string[];
  regionKeys: string[];
};

const commons = (file: string, width = 1400) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

/**
 * The 10 official regions of Cameroon — Visit Cameroon catalogue.
 */
export const regions: RegionCard[] = [
  {
    id: "extreme-nord",
    slug: "extreme-nord",
    nameFr: "Extrême-Nord",
    nameEn: "Far North",
    taglineFr: "Savane, Waza, Rhumsiki et architecture sahélienne.",
    taglineEn: "Savannah, Waza, Rhumsiki and Sahelian architecture.",
    storyFr:
      "Porte du Sahel camerounais : ici la lumière est dure, les villages de terre et les grands parcs racontent une Afrique pastorale et guerrière. Maroua sert de base ; Waza et les Monts Mandara offrent safari et villages perchés.",
    storyEn:
      "Gateway to Cameroon’s Sahel: hard light, earthen villages and great parks tell a pastoral story. Maroua is the base; Waza and the Mandara Mountains bring safari and cliff-top villages.",
    toVisitFr: [
      "Parc national de Waza (safari en saison sèche)",
      "Villages et pics de Rhumsiki",
      "Habitats traditionnels des Monts Mandara",
      "Marchés et artisanat de Maroua",
    ],
    toVisitEn: [
      "Waza National Park (dry-season safari)",
      "Rhumsiki villages and peaks",
      "Traditional dwellings of the Mandara Mountains",
      "Maroua markets and crafts",
    ],
    image: commons("Montagne du Parc de Waza - Extreme Nord - Cameroun.jpg"),
    imageCredit: "Wikimedia · Parc de Waza",
    href: "/explore/extreme-nord",
    culturalZone: "Sudano-Sahelian",
    cityKeys: ["maroua", "waza", "rhumsiki", "mokolo", "kaele", "yagoua", "kola", "maga", "boboyo", "pouss"],
    regionKeys: ["extreme-nord", "extrême-nord", "extreme nord", "far north"],
  },
  {
    id: "nord",
    slug: "nord",
    nameFr: "Nord",
    nameEn: "North",
    taglineFr: "Garoua, lamidats, Faro et porte du grand Nord.",
    taglineEn: "Garoua, lamidates, Faro and gateway to the Far North.",
    storyFr:
      "Entre Bénoué et savane, la région du Nord mêle villes lamidales, marchés et architectures de terre. Garoua est la porte d’entrée du grand Nord : d’ici partent les routes vers Faro, les lamidats et, plus au nord, les paysages sahéliens.",
    storyEn:
      "Between the Benue and the savannah, the North Region mixes lamidate towns, markets and earthen architecture. Garoua is the gateway to the greater North: from here roads lead to Faro, the lamidates and, further north, Sahelian landscapes.",
    toVisitFr: [
      "Garoua et ses marchés",
      "Parc national du Faro",
      "Lamidats et patrimoine islamique du Nord",
      "Lac de Lagdo (selon accès)",
    ],
    toVisitEn: [
      "Garoua and its markets",
      "Faro National Park",
      "Lamidates and northern Islamic heritage",
      "Lake Lagdo (access permitting)",
    ],
    image: "/regions/nord.png",
    imageCredit: "Photo contributeur · Architecture de terre du grand Nord",
    href: "/explore/nord",
    culturalZone: "Sudano-Sahelian",
    cityKeys: ["garoua", "figuil", "lagdo", "poli", "tchollire", "tcholliré", "demsa", "faro"],
    regionKeys: ["nord", "north"],
  },
  {
    id: "adamaoua",
    slug: "adamaoua",
    nameFr: "Adamaoua",
    nameEn: "Adamawa",
    taglineFr: "Ngaoundéré, lac Tison et hauts plateaux.",
    taglineEn: "Ngaoundéré, Lake Tison and highland plateaus.",
    storyFr:
      "Charnière entre forêt et Sahel, l’Adamaoua est un plateau d’élevage et de lacs. Ngaoundéré, ville carrefour, mène au lac Tison, aux chutes et aux randonnées d’altitude au climat plus frais.",
    storyEn:
      "A hinge between forest and Sahel, Adamawa is a plateau of cattle and lakes. Ngaoundéré leads to Lake Tison, waterfalls and cooler highland walks.",
    toVisitFr: [
      "Lac Tison",
      "Chutes Lancrenon",
      "Ngaoundéré et le lamidat",
      "Randonnées sur les plateaux",
    ],
    toVisitEn: [
      "Lake Tison",
      "Lancrenon Falls",
      "Ngaoundéré and the lamidate",
      "Plateau hikes",
    ],
    image: commons("LAC TISON.jpg"),
    imageCredit: "Wikimedia · Lac Tison",
    href: "/explore/adamaoua",
    culturalZone: "Sudano-Sahelian",
    cityKeys: ["ngaoundere", "ngaoundéré", "banyo", "tibati", "meiganga", "tison", "ngan-ha"],
    regionKeys: ["adamaoua", "adamawa"],
  },
  {
    id: "est",
    slug: "est",
    nameFr: "Est",
    nameEn: "East",
    taglineFr: "Forêt du bassin du Congo, peuples Baka et biodiversité.",
    taglineEn: "Congo Basin forest, Baka communities and biodiversity.",
    storyFr:
      "L’Est est le grand poumon forestier du Cameroun. Autour de Bertoua s’ouvrent routes vers Yokadouma, Moloundou et les réserves. Rencontres avec les communautés forestières (dont Baka), observation de faune et écotourisme responsable y donnent le ton.",
    storyEn:
      "The East is Cameroon’s great forest lung. From Bertoua, roads lead to Yokadouma, Moloundou and reserves. Meetings with forest communities (including Baka), wildlife watching and responsible ecotourism set the tone.",
    toVisitFr: [
      "Rencontres et habitats forestiers Baka (circuits responsables)",
      "Bertoua et artisanat de l’Est",
      "Pistes vers Yokadouma / Moloundou",
      "Réserves et observation de faune (selon saisons)",
    ],
    toVisitEn: [
      "Baka forest encounters (responsible tours)",
      "Bertoua and East Region crafts",
      "Routes toward Yokadouma / Moloundou",
      "Reserves and wildlife watching (seasonal)",
    ],
    image: "/regions/est.png",
    imageCredit: "Photo contributeur · Communauté forestière, Est",
    href: "/explore/est",
    culturalZone: "Fang-Beti",
    cityKeys: ["bertoua", "abong", "batouri", "yokadouma", "moloundou"],
    regionKeys: ["est", "east"],
  },
  {
    id: "centre",
    slug: "centre",
    nameFr: "Centre",
    nameEn: "Centre",
    taglineFr: "Yaoundé, collines et mémoire Beti-Ewondo.",
    taglineEn: "Yaoundé, hills and Beti-Ewondo memory.",
    storyFr:
      "Capitale politique posée sur des collines vertes, le Centre est le cœur Beti-Ewondo moderne. Yaoundé concentre musées, places de mémoire et portes vers la forêt (Mbalmayo, Ebogo) pour des escapades d’un jour.",
    storyEn:
      "The political capital on green hills, the Centre is the modern Beti-Ewondo heartland. Yaoundé holds museums and memorial places, with day trips into the forest (Mbalmayo, Ebogo).",
    toVisitFr: [
      "Collines et panorama de Yaoundé",
      "Lieux de mémoire Beti-Ewondo",
      "Site d’Ebogo / Mbalmayo",
      "Basilique de Mvolyé",
    ],
    toVisitEn: [
      "Yaoundé hills and viewpoints",
      "Beti-Ewondo memorial places",
      "Ebogo / Mbalmayo site",
      "Mvolyé basilica",
    ],
    image: commons("Basilique Marie-Reine des apôtres de Mvolyé.JPG"),
    imageCredit: "Wikimedia · Basilique de Mvolyé",
    href: "/explore/centre",
    culturalZone: "Fang-Beti",
    cityKeys: [
      "yaounde",
      "yaoundé",
      "mbalmayo",
      "mfou",
      "soa",
      "nkolmetet",
      "nkolmétet",
      "obala",
      "monatele",
    ],
    regionKeys: ["centre", "center"],
  },
  {
    id: "sud",
    slug: "sud",
    nameFr: "Sud",
    nameEn: "South",
    taglineFr: "Kribi, chutes de la Lobé et forêt atlantique.",
    taglineEn: "Kribi, Lobé Falls and Atlantic forest.",
    storyFr:
      "Le Sud allie océan et forêt : Kribi pour la plage, les chutes de la Lobé qui rejoignent l’Atlantique, Ebolowa et les pistes vers Campo. Ideal week-end mer + nature.",
    storyEn:
      "The South blends ocean and forest: Kribi for the beach, Lobé Falls meeting the Atlantic, Ebolowa and routes to Campo. Ideal sea-and-nature weekend.",
    toVisitFr: [
      "Plages de Kribi",
      "Chutes de la Lobé",
      "Ebolowa et musées locaux",
      "Parc / côte de Campo (selon accès)",
    ],
    toVisitEn: [
      "Kribi beaches",
      "Lobé Falls",
      "Ebolowa and local museums",
      "Campo coast / park (access permitting)",
    ],
    image: commons("Beach of Kribi, Cameroon.jpg"),
    imageCredit: "Wikimedia · Plage de Kribi",
    href: "/explore/sud",
    culturalZone: "Fang-Beti",
    cityKeys: ["kribi", "ebolowa", "campo", "ambam", "sangmelima", "lolodorf", "nkolandom", "ebogo"],
    regionKeys: ["sud", "south"],
  },
  {
    id: "littoral",
    slug: "littoral",
    nameFr: "Littoral",
    nameEn: "Littoral",
    taglineFr: "Douala, Wouri, culture Sawa et métropole.",
    taglineEn: "Douala, Wouri River, Sawa culture and the metropolis.",
    storyFr:
      "Cœur économique du pays, le Littoral bat au rythme de Douala et du fleuve Wouri. Culture Sawa, Ngondo, gastronomie de mer et patrimoine urbain : une région intense, à explorer quartier par quartier.",
    storyEn:
      "Cameroon’s economic heart, the Littoral beats with Douala and the Wouri River. Sawa culture, Ngondo, seafood and urban heritage: an intense region to explore neighbourhood by neighbourhood.",
    toVisitFr: [
      "Fleuve Wouri et ponts de Douala",
      "Patrimoine et fêtes Sawa (Ngondo)",
      "Quartiers historiques (Bonanjo, Akwa…)",
      "Gastronomie de mer",
    ],
    toVisitEn: [
      "Wouri River and Douala bridges",
      "Sawa heritage and Ngondo festival",
      "Historic districts (Bonanjo, Akwa…)",
      "Seafood cuisine",
    ],
    image: commons("River Wouri Douala Cameroon.jpg"),
    imageCredit: "Wikimedia · Fleuve Wouri",
    href: "/explore/littoral",
    culturalZone: "Sawa",
    cityKeys: [
      "douala",
      "edea",
      "edéa",
      "nkongsamba",
      "yabassi",
      "mouanko",
      "manoka",
      "loum",
      "melong",
    ],
    regionKeys: ["littoral"],
  },
  {
    id: "ouest",
    slug: "ouest",
    nameFr: "Ouest",
    nameEn: "West",
    taglineFr: "Chefferies Bamiléké, Foumban Bamoun et lacs.",
    taglineEn: "Bamileke chiefdoms, Bamoun Foumban and lakes.",
    storyFr:
      "Royaume des Grassfields : grandes cases, musées royaux, artisanat perlé. De Bafoussam à Bandjoun et Foumban, chaque chefferie raconte un pouvoir et un savoir-faire. Les lacs et montagnes complètent le tableau.",
    storyEn:
      "Heart of the Grassfields: monumental halls, royal museums, beadwork. From Bafoussam to Bandjoun and Foumban, each chiefdom tells a story of power and craft. Lakes and mountains complete the picture.",
    toVisitFr: [
      "Chefferie et grande case de Bandjoun",
      "Palais royal Bamoun à Foumban",
      "Bafoussam et marchés",
      "Lacs et collines de l’Ouest",
    ],
    toVisitEn: [
      "Bandjoun chiefdom and great hall",
      "Bamoun royal palace in Foumban",
      "Bafoussam and markets",
      "West Region lakes and hills",
    ],
    image: commons("Grande Case à la chefferie Bandjoun.jpg"),
    imageCredit: "Wikimedia · Chefferie de Bandjoun",
    href: "/explore/ouest",
    culturalZone: "Grassfields",
    cityKeys: [
      "bafoussam",
      "foumban",
      "dschang",
      "bafang",
      "mbouda",
      "bandjoun",
      "batoufam",
      "bahouan",
      "bana",
      "noun",
      "bangangte",
      "bangangté",
    ],
    regionKeys: ["ouest", "west"],
  },
  {
    id: "nord-ouest",
    slug: "nord-ouest",
    nameFr: "Nord-Ouest",
    nameEn: "North-West",
    taglineFr: "Bamenda, Ring Road, chutes et hautes terres.",
    taglineEn: "Bamenda, Ring Road, waterfalls and highlands.",
    storyFr:
      "Hautes terres verdoyantes, routes en lacets et chefferies : le Nord-Ouest invite à la Ring Road, aux cascades et aux villages de montagne. Bamenda est la base ; Oku, Bafut et les collines Boyo prolongent l’aventure.",
    storyEn:
      "Green highlands, winding roads and chiefdoms: the North-West invites you onto the Ring Road, to waterfalls and mountain villages. Bamenda is the base; Oku, Bafut and the Boyo hills extend the journey.",
    toVisitFr: [
      "Ring Road et panoramas",
      "Chutes et randonnées en altitude",
      "Chefferies (Oku, Bafut…)",
      "Bamenda et collines Boyo",
    ],
    toVisitEn: [
      "Ring Road and viewpoints",
      "Highland waterfalls and hikes",
      "Chiefdoms (Oku, Bafut…)",
      "Bamenda and Boyo hills",
    ],
    image: "/regions/nord-ouest.png",
    imageCredit: "Photo contributeur · Hautes terres du Nord-Ouest",
    href: "/explore/nord-ouest",
    culturalZone: "Grassfields",
    cityKeys: ["bamenda", "oku", "wum", "kumbo", "nso", "bafut", "fungom"],
    regionKeys: ["nord-ouest", "north-west", "northwest"],
  },
  {
    id: "sud-ouest",
    slug: "sud-ouest",
    nameFr: "Sud-Ouest",
    nameEn: "South-West",
    taglineFr: "Buea, Limbé, Mont Cameroun et mémoire de la réunification.",
    taglineEn: "Buea, Limbe, Mount Cameroon and reunification memory.",
    storyFr:
      "Au pied du volcan, le Sud-Ouest mêle histoire anglophone, plages de Limbé et randonnées vers le Mont Cameroun. À Buea, le monument de la Réunification rappelle l’unité du pays ; la mer et la forêt tropicale sont à portée de route.",
    storyEn:
      "At the foot of the volcano, the South-West blends Anglophone history, Limbe beaches and hikes up Mount Cameroon. In Buea, the Reunification Monument recalls national unity; sea and rainforest are a short drive away.",
    toVisitFr: [
      "Monument de la Réunification (Buea)",
      "Ascension / vues du Mont Cameroun",
      "Limbé : plages et Wildlife Centre",
      "Lacs Barombi",
    ],
    toVisitEn: [
      "Reunification Monument (Buea)",
      "Mount Cameroon hike / viewpoints",
      "Limbe beaches and Wildlife Centre",
      "Barombi lakes",
    ],
    image: "/regions/sud-ouest.png",
    imageCredit: "Photo contributeur · Monument de la Réunification, Buea",
    href: "/explore/sud-ouest",
    culturalZone: "Sawa",
    cityKeys: ["limbe", "limbé", "buea", "kumba", "mamfe", "mundemba", "tiko", "barombi"],
    regionKeys: ["sud-ouest", "south-west", "southwest"],
  },
];

export function normalizeKey(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

export function placeMatchesRegion(
  place: { region?: string; city?: string },
  region: RegionCard,
): boolean {
  const reg = normalizeKey(place.region || "");
  if (reg) {
    if (reg === normalizeKey(region.slug)) return true;
    if (region.regionKeys.some((k) => reg === normalizeKey(k))) return true;
  }
  const city = normalizeKey(place.city || "");
  if (!city) return false;
  return region.cityKeys.some((k) => {
    const key = normalizeKey(k);
    return city === key || city.includes(key);
  });
}

export const thingFilters = [
  { id: "all", labelFr: "Tout", labelEn: "All" },
  { id: "nature", labelFr: "Nature", labelEn: "Nature" },
  { id: "culture", labelFr: "Culture & patrimoine", labelEn: "Culture & heritage" },
  { id: "plage", labelFr: "Plages", labelEn: "Beaches" },
  { id: "famille", labelFr: "En famille", labelEn: "Family fun" },
  { id: "gastro", labelFr: "Gastronomie", labelEn: "Dine" },
  { id: "eco", labelFr: "Écotourisme", labelEn: "Ecotourism" },
] as const;
