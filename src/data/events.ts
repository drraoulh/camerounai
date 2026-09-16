export type EventItem = {
  id: string;
  titleFr: string;
  titleEn: string;
  dateLabelFr: string;
  dateLabelEn: string;
  city: string;
  summaryFr: string;
  summaryEn: string;
  category: "festival" | "culture" | "nature" | "sport";
  image: string;
  sourceLabel?: string;
};

const commons = (file: string, width = 1600) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

/** Real Cameroon festivals & seasonal highlights — Wikimedia Commons photos. */
export const events: EventItem[] = [
  {
    id: "ngondo",
    titleFr: "Ngondo : fête du peuple Sawa",
    titleEn: "Ngondo: Sawa people festival",
    dateLabelFr: "Début décembre",
    dateLabelEn: "Early December",
    city: "Douala",
    summaryFr:
      "Rituel du jengu sur le Wouri, pirogues, danses et patrimoine vivant : le grand rendez-vous côtier du Littoral (inscrit au patrimoine culturel immatériel).",
    summaryEn:
      "Jengu ritual on the Wouri, canoe races, dance and living heritage: the major coastal gathering of the Littoral (intangible cultural heritage).",
    category: "festival",
    image: commons("NGONDO 2024 Festival 01.jpg"),
    sourceLabel: "Wikimedia · Ngondo 2024",
  },
  {
    id: "nyem-nyem",
    titleFr: "Festival Nyem-Nyem",
    titleEn: "Nyem-Nyem Festival",
    dateLabelFr: "Février",
    dateLabelEn: "February",
    city: "Foumban",
    summaryFr:
      "Danses, musique et artisanat Bamoun autour du palais royal : immersion Grassfields à Foumban.",
    summaryEn:
      "Bamoun dance, music and crafts around the royal palace: a Grassfields immersion in Foumban.",
    category: "culture",
    image: commons("Foumban.jpg"),
    sourceLabel: "Wikimedia · Foumban",
  },
  {
    id: "mount-cameroon-race",
    titleFr: "Course de l’Espoir du Mont Cameroun",
    titleEn: "Mount Cameroon Race of Hope",
    dateLabelFr: "Février",
    dateLabelEn: "February",
    city: "Buea",
    summaryFr:
      "Course mythique aller-retour vers le sommet du volcan : sport, culture bakweri et foule à Buea.",
    summaryEn:
      "Legendary out-and-back race to the volcano summit: sport, Bakweri culture and crowds in Buea.",
    category: "sport",
    image: commons("Landscape_of_Mount_Cameroon.jpg"),
    sourceLabel: "Wikimedia · Mount Cameroon",
  },
  {
    id: "lobe-season",
    titleFr: "Saison des chutes de la Lobé",
    titleEn: "Lobé Falls season",
    dateLabelFr: "Toute l’année",
    dateLabelEn: "Year-round",
    city: "Kribi",
    summaryFr:
      "Les chutes qui rejoignent l’Atlantique : balades, pirogues et photos au coucher du soleil près de Kribi.",
    summaryEn:
      "Falls meeting the Atlantic: walks, canoes and sunset photos near Kribi.",
    category: "nature",
    image: commons("Chutes de la Lobé.jpg"),
    sourceLabel: "Wikimedia · Lobé Falls",
  },
];
