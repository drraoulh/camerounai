/**
 * Visit Cameroon knowledge base — curated bilingual documents for RAG.
 * Educational tourism content; verify visas, health and security with official sources.
 */

export type KbCategory =
  | "overview"
  | "history"
  | "geography"
  | "regions"
  | "culture"
  | "cities"
  | "nature"
  | "practical"
  | "food"
  | "languages"
  | "festivals"
  | "etiquette"
  | "economy";

export type KnowledgeDoc = {
  id: string;
  category: KbCategory;
  /** Search keywords (fr + en, lowercase) */
  keywords: string[];
  titleFr: string;
  titleEn: string;
  bodyFr: string;
  bodyEn: string;
};

export const cameroonKnowledgeBase: KnowledgeDoc[] = [
  {
    id: "overview",
    category: "overview",
    keywords: [
      "cameroun",
      "cameroon",
      "pays",
      "country",
      "afrique",
      "africa",
      "présentation",
      "presentation",
      "qu'est-ce",
      "what is",
      "république",
      "republic",
      "mintoul",
    ],
    titleFr: "Le Cameroun en bref",
    titleEn: "Cameroon at a glance",
    bodyFr:
      "La République du Cameroun est un pays d’Afrique centrale surnommé « l’Afrique en miniature » : côte atlantique, forêts tropicales, hauts plateaux Grassfields, savane et Sahel. Capitale politique : Yaoundé. Hub économique : Douala. Monnaie : franc CFA (XAF). Langues officielles : français et anglais. Dix régions administratives. Visit Cameroon (MINTOUL) accompagne les visiteurs pour découvrir destinations, cultures et voyages responsables.",
    bodyEn:
      "The Republic of Cameroon is a Central African country nicknamed “Africa in miniature”: Atlantic coast, rainforests, Grassfields highlands, savannah and Sahel. Political capital: Yaoundé. Economic hub: Douala. Currency: CFA franc (XAF). Official languages: French and English. Ten administrative regions. Visit Cameroon (MINTOUL) helps visitors discover destinations, cultures and responsible travel.",
  },
  {
    id: "geography-climate",
    category: "geography",
    keywords: [
      "géographie",
      "geography",
      "climat",
      "climate",
      "saison",
      "season",
      "pluie",
      "rain",
      "sèche",
      "dry",
      "météo",
      "meteo",
      "weather",
      "relief",
      "volcan",
      "mont cameroun",
      "mount cameroon",
    ],
    titleFr: "Géographie et climat",
    titleEn: "Geography and climate",
    bodyFr:
      "Le relief va de la plaine côtière (Littoral, Sud-Ouest) au Mont Cameroun (volcan actif près de Buea/Limbé), aux plateaux de l’Ouest et du Nord-Ouest, à la forêt du Sud et de l’Est, puis à la savane et au Sahel vers le Nord. Saison sèche globale souvent nov.–mars (idéale pour safaris Extrême-Nord et plages). Pluies plus fréquentes avril–octobre selon la région ; le littoral et le Sud-Ouest peuvent être très humides. Emportez couches, imperméable léger et crème solaire.",
    bodyEn:
      "Landforms range from the coastal plain (Littoral, South-West) to Mount Cameroon (active volcano near Buea/Limbé), the West and North-West highlands, southern and eastern rainforest, then savannah and Sahel toward the North. Countrywide dry season is often Nov–Mar (best for Far North safaris and beaches). Rain is more likely April–October by region; the coast and South-West can be very humid. Pack layers, a light rain jacket and sunscreen.",
  },
  {
    id: "history",
    category: "history",
    keywords: [
      "histoire",
      "history",
      "indépendance",
      "independence",
      "réunification",
      "reunification",
      "colonie",
      "colonisation",
      "kamerun",
      "mandat",
      "mandate",
      "royaume",
      "kingdom",
      "passé",
    ],
    titleFr: "Repères historiques",
    titleEn: "Historical landmarks",
    bodyFr:
      "Avant la colonisation : sociétés forestières, chefferies Grassfields, lamidats du Nord, cultures côtières Sawa. Colonie allemande (Kamerun), puis mandats français et britanniques après 1919 — d’où le bilinguisme officiel. 1er janvier 1960 : indépendance du Cameroun sous tutelle française. 1er octobre 1961 : réunification avec le Cameroun méridional britannique. Le monument de la Réunification à Buea et les fêtes nationales rappellent cette mémoire. Aujourd’hui : État unitaire décentralisé, dix régions, richesse culturelle et naturelle pour le tourisme.",
    bodyEn:
      "Before colonisation: forest societies, Grassfields chiefdoms, northern lamidates, coastal Sawa cultures. German colony (Kamerun), then French and British mandates after 1919 — hence official bilingualism. 1 January 1960: independence of French-administered Cameroon. 1 October 1961: reunification with British Southern Cameroons. The Reunification Monument in Buea and national days keep that memory alive. Today: unitary decentralised state, ten regions, cultural and natural wealth for tourism.",
  },
  {
    id: "institutions",
    category: "overview",
    keywords: [
      "président",
      "president",
      "gouvernement",
      "government",
      "institutions",
      "politique",
      "politics",
      "biya",
      "état",
      "state",
      "capitale",
      "capital",
    ],
    titleFr: "Institutions et repères civiques",
    titleEn: "Institutions and civic facts",
    bodyFr:
      "Capitale : Yaoundé. Régime : république unitaire décentralisée à caractère présidentiel. Chef de l’État : Paul Biya (Président de la République, depuis 1982). Devise : Paix – Travail – Patrie. Drapeau : vert, rouge, jaune avec étoile jaune. Hymne : Chant de Ralliement. Pour toute information officielle à jour (lois, élections, démarches), consultez les canaux gouvernementaux — Visit Cameroon se concentre sur le tourisme.",
    bodyEn:
      "Capital: Yaoundé. System: unitary decentralised republic with a presidential character. Head of State: Paul Biya (President of the Republic, since 1982). Motto: Peace – Work – Fatherland. Flag: green, red, yellow with a yellow star. Anthem: O Cameroon, Cradle of Our Forefathers. For up-to-date official information (laws, elections, procedures), consult government channels — Visit Cameroon focuses on tourism.",
  },
  {
    id: "regions-10",
    category: "regions",
    keywords: [
      "région",
      "region",
      "régions",
      "regions",
      "extrême-nord",
      "extreme-nord",
      "far north",
      "adamaoua",
      "adamawa",
      "centre",
      "est",
      "east",
      "extrême",
      "littoral",
      "nord",
      "north",
      "nord-ouest",
      "north-west",
      "ouest",
      "west",
      "sud",
      "south",
      "sud-ouest",
      "south-west",
    ],
    titleFr: "Les 10 régions",
    titleEn: "The 10 regions",
    bodyFr:
      "Extrême-Nord (Maroua, Waza, Mandara) · Nord (Garoua, Faro) · Adamaoua (Ngaoundéré, plateaux) · Est (forêt, biodiversity) · Centre (Yaoundé, Fang-Beti) · Sud (Ebolowa, océan/forêt) · Littoral (Douala, côte) · Sud-Ouest (Limbé, Buea, Mont Cameroun) · Ouest (Bafoussam, chefferies) · Nord-Ouest (Bamenda, Ring Road). Chaque région a une saison et un rythme distincts : demandez une ville ou un thème (plage, safari, chefferies) pour un parcours précis.",
    bodyEn:
      "Far North (Maroua, Waza, Mandara) · North (Garoua, Faro) · Adamawa (Ngaoundéré, plateaus) · East (forest, biodiversity) · Centre (Yaoundé, Fang-Beti) · South (Ebolowa, ocean/forest) · Littoral (Douala, coast) · South-West (Limbé, Buea, Mount Cameroon) · West (Bafoussam, chiefdoms) · North-West (Bamenda, Ring Road). Each region has its own season and pace — name a city or theme (beach, safari, chiefdoms) for a concrete route.",
  },
  {
    id: "culture-areas",
    category: "culture",
    keywords: [
      "culture",
      "culturel",
      "cultural",
      "sawa",
      "grassfields",
      "grassfield",
      "fang",
      "beti",
      "ewondo",
      "sahel",
      "sudano",
      "bamileke",
      "bamiléké",
      "bamoun",
      "chefferie",
      "lamidat",
      "patrimoine",
      "heritage",
    ],
    titleFr: "Grandes aires culturelles",
    titleEn: "Major cultural areas",
    bodyFr:
      "Sawa (littoral : Douala, Limbé — mer, Ngondo, pirogues) · Grassfields (Ouest / Nord-Ouest : chefferies, Bamoun à Foumban, artisanat) · Fang-Beti (Centre / Sud / Est : Ewondo, forêt, bikutsi, mémoire urbaine à Yaoundé) · Sudano-Sahelian (Nord / Extrême-Nord : lamidats, savane, architecture de terre). Ces aires structurent festivals, langues, gastronomie et circuits Visit Cameroon.",
    bodyEn:
      "Sawa (coast: Douala, Limbé — sea, Ngondo, canoes) · Grassfields (West / North-West: chiefdoms, Bamoun in Foumban, crafts) · Fang-Beti (Centre / South / East: Ewondo, forest, bikutsi, urban memory in Yaoundé) · Sudano-Sahelian (North / Far North: lamidates, savannah, earthen architecture). These areas shape festivals, languages, food and Visit Cameroon routes.",
  },
  {
    id: "cities-hubs",
    category: "cities",
    keywords: [
      "ville",
      "city",
      "yaoundé",
      "yaounde",
      "douala",
      "kribi",
      "limbé",
      "limbe",
      "buea",
      "foumban",
      "bafoussam",
      "bamenda",
      "maroua",
      "garoua",
      "ngaoundéré",
      "ngaoundere",
      "ebolowa",
    ],
    titleFr: "Villes portes d’entrée",
    titleEn: "Gateway cities",
    bodyFr:
      "Yaoundé : capitale, musées, collines, base Fang-Beti. Douala : hub aérien et économique, culture Sawa, gastronomie. Kribi : plages et chutes de la Lobé. Limbé / Buea : volcan, plages noires, jardin botanique. Foumban : patrimoine Bamoun. Bafoussam / Bamenda : Grassfields et chefferies. Maroua / Garoua : portes du grand Nord et safaris. Ngaoundéré : Adamaoua et train du Nord. Choisissez 1–2 hubs selon durée et budget.",
    bodyEn:
      "Yaoundé: capital, museums, hills, Fang-Beti base. Douala: air and economic hub, Sawa culture, food. Kribi: beaches and Lobé Falls. Limbé / Buea: volcano, black-sand beaches, botanic garden. Foumban: Bamoun heritage. Bafoussam / Bamenda: Grassfields and chiefdoms. Maroua / Garoua: gateways to the greater North and safaris. Ngaoundéré: Adamawa and the northern rail line. Pick 1–2 hubs based on time and budget.",
  },
  {
    id: "nature-parks",
    category: "nature",
    keywords: [
      "nature",
      "parc",
      "park",
      "safari",
      "waza",
      "faro",
      "réserve",
      "reserve",
      "faune",
      "wildlife",
      "forêt",
      "forest",
      "cascade",
      "waterfall",
      "plage",
      "beach",
      "montagne",
      "mountain",
      "écologie",
      "ecotourisme",
      "ecotourism",
    ],
    titleFr: "Nature et parcs",
    titleEn: "Nature and parks",
    bodyFr:
      "Parcs emblématiques : Waza (Extrême-Nord, saison sèche), Faro (Nord), et de nombreuses réserves forestières à l’Est et au Sud. Côte : Kribi, Limbé. Mont Cameroun pour la randonnée volcanique. Chutes (Lobé, Ekom-Nkam selon accès). Écotourisme : guides locaux, sentiers balisés, zéro déchet, pas de nourrissage de la faune, droits d’entrée qui financent la conservation. Vérifiez ouvertures et sécurité locale avant un safari ou une trekkée isolée.",
    bodyEn:
      "Flagship parks: Waza (Far North, dry season), Faro (North), plus many forest reserves in the East and South. Coast: Kribi, Limbé. Mount Cameroon for volcanic hiking. Waterfalls (Lobé, Ekom-Nkam when accessible). Ecotourism: local guides, marked trails, pack out rubbish, no wildlife feeding, park fees that fund conservation. Check openings and local security before remote safaris or treks.",
  },
  {
    id: "practical-entry",
    category: "practical",
    keywords: [
      "visa",
      "passeport",
      "passport",
      "entrée",
      "entry",
      "formalités",
      "formalities",
      "ambassade",
      "embassy",
      "arrivée",
      "arrival",
      "aéroport",
      "airport",
      "douala",
      "nsimalen",
    ],
    titleFr: "Formalités d’entrée",
    titleEn: "Entry formalities",
    bodyFr:
      "Passeport valide recommandé (souvent 6 mois après le retour). De nombreux voyageurs ont besoin d’un visa : renseignez-vous auprès de l’ambassade/consulat du Cameroun ou des procédures e-visa officielles — les règles changent. À l’arrivée (surtout DLA Douala et NSI Yaoundé-Nsimalen) : billets, réservation d’hôtel et preuves de fonds accessibles ; préférez transferts d’hôtel ou taxis connus la nuit. Visit Cameroon ne remplace pas un conseil consulaire.",
    bodyEn:
      "A valid passport is recommended (often 6 months beyond return). Many travellers need a visa — check a Cameroon embassy/consulate or official e-visa channels; rules change. On arrival (especially DLA Douala and NSI Yaoundé-Nsimalen): keep tickets, hotel booking and proof of funds handy; prefer hotel transfers or known taxis at night. Visit Cameroon does not replace consular advice.",
  },
  {
    id: "practical-health",
    category: "practical",
    keywords: [
      "santé",
      "health",
      "vaccin",
      "vaccine",
      "fièvre jaune",
      "yellow fever",
      "paludisme",
      "malaria",
      "eau",
      "water",
      "assurance",
      "insurance",
      "médecin",
      "doctor",
    ],
    titleFr: "Santé voyageur",
    titleEn: "Traveller health",
    bodyFr:
      "Fièvre jaune : souvent exigée selon votre trajet — consultez un centre de vaccination internationale. Paludisme : risque dans une grande partie du pays (prophylaxie, répulsif, moustiquaire). Eau embouteillée ou filtrée ; prudence avec glaçons et fruits non pelés. Assurance voyage (soins + rapatriement) fortement conseillée. Emportez ordonnances et trousse de base. Sources à vérifier : médecin traitant, OMS, autorités sanitaires.",
    bodyEn:
      "Yellow fever: often required depending on your itinerary — visit a travel clinic. Malaria: risk across much of the country (prophylaxis, repellent, mosquito net). Bottled or filtered water; be careful with ice and unpeeled fruit. Travel insurance (care + repatriation) is strongly advised. Pack prescriptions and a basic kit. Verify with your doctor, WHO and health authorities.",
  },
  {
    id: "practical-money-transport",
    category: "practical",
    keywords: [
      "argent",
      "money",
      "monnaie",
      "currency",
      "fcfa",
      "cfa",
      "budget",
      "transport",
      "train",
      "bus",
      "camrail",
      "taxi",
      "coût",
      "cost",
      "prix",
      "price",
    ],
    titleFr: "Monnaie et déplacements",
    titleEn: "Money and getting around",
    bodyFr:
      "Monnaie : franc CFA d’Afrique centrale (XAF). Espèces utiles hors grandes villes ; cartes dans hôtels et centres urbains. Changez dans banques/bureaux connus. Transport : aéroports (DLA, NSI, et domestiques selon saison), Camrail (Douala–Yaoundé, vers Ngaoundéré), gares routières VIP/confort. En ville : taxis et applications selon disponibilité. Budgets Visit Cameroon : estimations d’entrées/activités, hors long trajet et hôtel sauf mention contraire.",
    bodyEn:
      "Currency: Central African CFA franc (XAF). Cash is useful outside big cities; cards work in hotels and urban centres. Change money at known banks/bureaux. Transport: airports (DLA, NSI, plus domestic when available), Camrail (Douala–Yaoundé, toward Ngaoundéré), VIP/comfort bus stations. In cities: taxis and apps when available. Visit Cameroon budgets: estimated entries/activities unless lodging or long-distance travel is stated.",
  },
  {
    id: "food",
    category: "food",
    keywords: [
      "nourriture",
      "food",
      "cuisine",
      "gastronomie",
      "manger",
      "eat",
      "plat",
      "dish",
      "ndolé",
      "ndole",
      "eru",
      "achu",
      "poisson",
      "fish",
      "restaurant",
      "marché",
      "market",
    ],
    titleFr: "Gastronomie camerounaise",
    titleEn: "Cameroonian cuisine",
    bodyFr:
      "La table raconte les régions : ndolé (Littoral), eru/okok, poisson braisé à la côte, achu et mets Grassfields, grillades et sauces du Nord, fruits tropicaux partout. Marchés et maquis (restaurants populaires) sont l’âme culinaire ; hôtels et tables urbaines offrent aussi une cuisine internationale. Demandez des adresses Visit Cameroon sur « Manger » ou une ville précise. Hygiène : lieux fréquentés, eau sûre.",
    bodyEn:
      "The plate tells the regions: ndolé (Littoral), eru/okok, grilled fish on the coast, achu and Grassfields dishes, northern grills and sauces, tropical fruit everywhere. Markets and maquis (popular eateries) are the culinary heart; hotels and city tables also serve international food. Ask Visit Cameroon for “Eat” listings or a specific city. Hygiene: busy places and safe water.",
  },
  {
    id: "languages",
    category: "languages",
    keywords: [
      "langue",
      "language",
      "langues",
      "languages",
      "français",
      "french",
      "anglais",
      "english",
      "pidgin",
      "ewondo",
      "duala",
      "fulfulde",
      "yemba",
      "expression",
      "phrase",
      "apprend",
      "learn",
    ],
    titleFr: "Langues",
    titleEn: "Languages",
    bodyFr:
      "Français et anglais sont officiels (héritage des mandats). Des dizaines de langues nationales : ewondo, duala, fulfulde, yemba, medumba, bamoun, etc. Le pidgin (Cameroon Pidgin English) circule surtout à l’Ouest et au Sud-Ouest. Apprendre quelques salutations ouvre les portes — section Learn Cameroon et expressions Visit Cameroon. L’assistant peut proposer des phrases utiles avec prononciation.",
    bodyEn:
      "French and English are official (mandate heritage). Dozens of national languages: Ewondo, Duala, Fulfulde, Yemba, Medumba, Bamoun, and more. Pidgin (Cameroon Pidgin English) is common especially in the West and South-West. A few greetings open doors — see Learn Cameroon and Visit Cameroon phrases. The assistant can offer useful lines with pronunciation.",
  },
  {
    id: "festivals",
    category: "festivals",
    keywords: [
      "festival",
      "fête",
      "feast",
      "ngondo",
      "nyang",
      "événement",
      "event",
      "cérémonie",
      "ceremony",
      "danse",
      "dance",
      "musique",
      "music",
    ],
    titleFr: "Fêtes et festivals",
    titleEn: "Festivals and celebrations",
    bodyFr:
      "Ngondo (Douala, décembre) : grande fête Sawa liée au fleuve et au jengu. Chefferies Grassfields : cérémonies, danses et artisanat selon calendriers locaux. Fêtes nationales (indépendance, réunification) et festivals urbains de musique/arts. Vérifiez dates chaque année — elles peuvent bouger. Pour un séjour culturel, alignez votre voyage sur une fête et réservez hébergement tôt.",
    bodyEn:
      "Ngondo (Douala, December): major Sawa festival linked to the river and jengu. Grassfields chiefdoms: ceremonies, dance and crafts on local calendars. National days (independence, reunification) and urban music/arts festivals. Check dates yearly — they can shift. For a cultural trip, align travel with a festival and book lodging early.",
  },
  {
    id: "etiquette",
    category: "etiquette",
    keywords: [
      "étiquette",
      "etiquette",
      "respect",
      "photo",
      "photograph",
      "habitude",
      "custom",
      "politesse",
      "polite",
      "communauté",
      "community",
      "responsable",
      "responsible",
    ],
    titleFr: "Savoir-vivre et voyage responsable",
    titleEn: "Etiquette and responsible travel",
    bodyFr:
      "Saluez avant de demander. Demandez le consentement avant de photographier personnes ou lieux sacrés. Habillez-vous modestement hors plages/hôtels touristiques, surtout villages et lieux de culte. Preférez guides locaux agréés et artisanat authentique. Dans les parcs : restez sur les sentiers, ne nourrissez pas la faune. Vous êtes invité·e — pas propriétaire du lieu.",
    bodyEn:
      "Greet before asking. Ask consent before photographing people or sacred places. Dress modestly away from beaches/tourist hotels, especially in villages and places of worship. Prefer licensed local guides and genuine crafts. In parks: stay on trails, do not feed wildlife. You are a guest — not the owner of the place.",
  },
  {
    id: "economy-tourism",
    category: "economy",
    keywords: [
      "économie",
      "economy",
      "tourisme",
      "tourism",
      "population",
      "habitants",
      "people",
      "emploi",
      "développement",
      "development",
    ],
    titleFr: "Économie et tourisme",
    titleEn: "Economy and tourism",
    bodyFr:
      "Douala concentre ports et affaires ; Yaoundé l’administration. Le tourisme valorise nature, patrimoine et hospitalité : emploi local (guides, hébergements, artisans, restauration). Population : ordre de grandeur ~28 millions. Visit Cameroon vise à rendre l’information touristique claire, bilingue et ancrée dans des faits vérifiables plutôt que des généralités inventées.",
    bodyEn:
      "Douala concentrates ports and business; Yaoundé the administration. Tourism highlights nature, heritage and hospitality: local jobs (guides, lodging, crafts, dining). Population: around ~28 million. Visit Cameroon aims to make tourism information clear, bilingual and grounded in verifiable facts rather than invented generalities.",
  },
];
