import type { CulturalZone } from "@/lib/types";

const commons = (file: string, width = 1600) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

export interface CulturalArea {
  id: CulturalZone;
  slug: string;
  nameFr: string;
  nameEn: string;
  /** Short card blurb */
  summaryFr: string;
  summaryEn: string;
  /** Fuller standalone description (culture page) */
  descriptionFr: string;
  descriptionEn: string;
  themes: string[];
  /** Dedicated Wikimedia / researched photo for this cultural area */
  image: string;
  imageCredit: string;
  href: string;
  /** Official regions covered by this cultural area */
  regionIds: string[];
  highlightsFr: string[];
  highlightsEn: string[];
}

export const culturalAreas: CulturalArea[] = [
  {
    id: "Sawa",
    slug: "sawa",
    nameFr: "Sawa",
    nameEn: "Sawa",
    summaryFr:
      "Peuples côtiers du Littoral et du Sud-Ouest : mer, pirogues, kaba et fête du Ngondo à Douala.",
    summaryEn:
      "Coastal peoples of the Littoral and South-West: sea, canoes, kaba dress and the Ngondo festival in Douala.",
    descriptionFr:
      "L’aire Sawa rassemble les peuples du littoral camerounais (Douala, Batanga, Bakweri et apparentés). La mer et le fleuve Wouri structurent le calendrier culturel : danses, pirogues, kaba et le grand Ngondo de décembre, cérémonie du jengu. Douala concentre gastronomie de mer, arts contemporains et patrimoine urbain. Le Sud-Ouest (Limbé, Buea) prolonge cette identité côtière avec le volcan et les plages.",
    descriptionEn:
      "The Sawa area brings together Cameroon’s coastal peoples (Douala, Batanga, Bakweri and related groups). The sea and Wouri River shape cultural life: dance, canoes, kaba dress and December’s Ngondo festival with its jengu ceremony. Douala is a hub for seafood cuisine, contemporary arts and urban heritage. The South-West (Limbé, Buea) extends this coastal identity with the volcano and beaches.",
    themes: ["Ngondo", "côte", "pirogues", "gastronomie", "Douala", "traditions"],
    image: commons("Danse sawa ngondo.jpg"),
    imageCredit: "Wikimedia Commons · Danse Sawa / Ngondo",
    href: "/culture#sawa",
    regionIds: ["littoral", "sud-ouest"],
    highlightsFr: [
      "Festival Ngondo (Douala, décembre)",
      "Pirogues et cérémonies sur le Wouri",
      "Cuisine de mer et kaba traditionnelle",
    ],
    highlightsEn: [
      "Ngondo festival (Douala, December)",
      "Canoes and ceremonies on the Wouri",
      "Seafood cuisine and traditional kaba",
    ],
  },
  {
    id: "Grassfields",
    slug: "grassfields",
    nameFr: "Grassfields",
    nameEn: "Grassfields",
    summaryFr:
      "Hauts plateaux de l’Ouest et du Nord-Ouest : chefferies Bamiléké, royaume Bamoun de Foumban, artisanat et cases monumentales.",
    summaryEn:
      "Highlands of the West and North-West: Bamileke chiefdoms, Bamoun kingdom of Foumban, crafts and monumental thatched halls.",
    descriptionFr:
      "Les Grassfields (Ouest et Nord-Ouest) sont le pays des chefferies et des royaumes. À Foumban, le sultanat Bamoun conserve palais, écriture shü-mom et artisanat royal. Chez les Bamiléké (Bandjoun, Batoufam, Bafoussam…), les grandes cases, musées royaux et marchés d’objets perlés racontent le pouvoir et la mémoire. Lacs, montagnes et festivals (Nyem-Nyem, etc.) complètent une offre culturelle très dense.",
    descriptionEn:
      "The Grassfields (West and North-West) are the land of chiefdoms and kingdoms. In Foumban, the Bamoun sultanate preserves its palace, shü-mom script and royal crafts. Among the Bamileke (Bandjoun, Batoufam, Bafoussam…), monumental halls, royal museums and beaded-object markets tell stories of power and memory. Lakes, mountains and festivals (Nyem-Nyem and more) complete a rich cultural offer.",
    themes: ["chefferies", "Bamoun", "Bamiléké", "artisanat", "palais", "Foumban"],
    image: commons("Sultanat Foumban.JPG"),
    imageCredit: "Wikimedia Commons · Sultanat de Foumban",
    href: "/culture#grassfields",
    regionIds: ["ouest", "nord-ouest"],
    highlightsFr: [
      "Palais royal Bamoun à Foumban",
      "Chefferie et musée de Bandjoun",
      "Artisanat perlé et marchés traditionnels",
    ],
    highlightsEn: [
      "Bamoun royal palace in Foumban",
      "Bandjoun chiefdom and museum",
      "Beadwork crafts and traditional markets",
    ],
  },
  {
    id: "Fang-Beti",
    slug: "fang-beti",
    nameFr: "Fang-Beti",
    nameEn: "Fang-Beti",
    summaryFr:
      "Centre, Sud et Est : culture Beti-Ewondo, savoirs forestiers, langues et traditions du plateau et de la forêt.",
    summaryEn:
      "Centre, South and East: Beti-Ewondo culture, forest knowledge, languages and highland–rainforest traditions.",
    descriptionFr:
      "L’aire Fang-Beti est avant tout celle des peuples Beti et Ewondo (et apparentés) du Centre, du Sud et d’une partie de l’Est. On y retrouve les savoirs de la forêt, les outils et gestes du quotidien, les langues (ewondo, fang…), le bikutsi et la mémoire des chefferies. Yaoundé porte aussi des lieux de mémoire Beti (héritage de Charles Atangana). Vers Ebolowa, Mbalmayo ou l’Est forestier, la culture reste liée à la terre, à l’artisanat et aux rites.",
    descriptionEn:
      "The Fang-Beti area is first the land of Beti and Ewondo peoples (and related groups) across the Centre, South and part of the East. It holds forest knowledge, everyday tools and crafts, languages (Ewondo, Fang…), bikutsi and chiefdom memory. Yaoundé also carries Beti memorial places (Charles Atangana’s legacy). Toward Ebolowa, Mbalmayo or the eastern forest, culture stays tied to land, craft and ritual life.",
    themes: ["Ewondo", "Beti", "forêt", "bikutsi", "langues", "savoirs"],
    image: commons("Les outils traditionels de la femme fang beti.jpg"),
    imageCredit: "Wikimedia Commons · Outils traditionnels Fang-Beti",
    href: "/culture#fang-beti",
    regionIds: ["centre", "sud", "est"],
    highlightsFr: [
      "Savoirs et outils traditionnels Fang-Beti",
      "Langue ewondo et patrimoine Beti",
      "Forêt, bikutsi et mémoire des chefferies",
    ],
    highlightsEn: [
      "Fang-Beti traditional knowledge and tools",
      "Ewondo language and Beti heritage",
      "Forest, bikutsi and chiefdom memory",
    ],
  },
  {
    id: "Sudano-Sahelian",
    slug: "sudano-sahelian",
    nameFr: "Soudano-sahélien",
    nameEn: "Sudano-Sahelian",
    summaryFr:
      "Extrême-Nord, Nord et Adamaoua : savane, lamidats, habitats Mofou et grands parcs comme Waza.",
    summaryEn:
      "Far North, North and Adamawa: savannah, lamidates, Mofou dwellings and major parks such as Waza.",
    descriptionFr:
      "Au nord du Cameroun, l’aire soudano-sahélienne mêle savane, architecture de terre et islam culturel des lamidats (Garoua, Ngaoundéré…). Les habitats Mofou des Monts Mandara, Rhumsiki et le parc de Waza illustrent un paysage unique. La saison sèche (décembre–avril) est la meilleure pour les safaris et les circuits culturels autour de Maroua.",
    descriptionEn:
      "In northern Cameroon, the Sudano-Sahelian area mixes savannah, earthen architecture and the cultural Islam of lamidates (Garoua, Ngaoundéré…). Mofou dwellings in the Mandara Mountains, Rhumsiki and Waza National Park form a unique landscape. The dry season (December–April) is best for safaris and cultural circuits around Maroua.",
    themes: ["savane", "lamidats", "Mofou", "Waza", "architecture", "safari"],
    image: commons("Case Mofou à Ouzzang dans l'extreme-Nord.jpg"),
    imageCredit: "Wikimedia Commons · Habitat Mofou, Extrême-Nord",
    href: "/culture#sudano-sahelian",
    regionIds: ["extreme-nord", "nord", "adamaoua"],
    highlightsFr: [
      "Habitats Mofou (Monts Mandara)",
      "Parc national de Waza",
      "Lamidats et villes du Nord / Adamaoua",
    ],
    highlightsEn: [
      "Mofou dwellings (Mandara Mountains)",
      "Waza National Park",
      "Lamidates and northern / Adamawa towns",
    ],
  },
];
