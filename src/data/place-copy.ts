/**
 * Reformulated place copy inspired by Ayila'a listings (and MINTOUL context).
 * Images will be wired later when the user provides them.
 * Keys = places.slug
 */
export type PlaceCopy = {
  /** Optional English display name when DB name_en is missing or French-only */
  nameEn?: string;
  descriptionFr: string;
  descriptionEn: string;
  culturalInfoFr?: string;
  culturalInfoEn?: string;
  estimatedCostXaf?: number;
  recommendedDurationHours?: number;
  bestPeriod?: string;
  sourceNote?: string;
};

export const placeCopyBySlug: Record<string, PlaceCopy> = {
  "chutes-de-la-lobe": {
    nameEn: "Lobé Falls",
    descriptionFr:
      "À environ 7 km du centre de Kribi, les chutes de la Lobé offrent un spectacle rare : le fleuve se jette directement dans l'océan Atlantique. Pirogues, baignade, fruits de mer et rencontres avec les communautés riveraines composent une sortie accessible à tous les âges.",
    descriptionEn:
      "About 7 km from central Kribi, the Lobé Falls are a rare sight: the river plunges straight into the Atlantic. Canoe rides, swimming, seafood and meetings with riverside communities make it a family-friendly outing.",
    culturalInfoFr:
      "Les guides locaux proposent des balades en pirogue au pied des cascades. À proximité : Grand Batanga, le phare de Kribi et le Lagon Bleu.",
    culturalInfoEn:
      "Local guides offer canoe trips at the foot of the falls. Nearby: Grand Batanga, Kribi lighthouse and the Blue Lagoon.",
    estimatedCostXaf: 5000,
    recommendedDurationHours: 3,
    bestPeriod: "Nov–Mai (saison sèche côtière)",
    sourceNote: "Ayila'a · reformulé Visit Cameroon",
  },
  "chutes-ekom-nkam": {
    nameEn: "Ekom-Nkam Falls",
    descriptionFr:
      "Près de Melong (Moungo), les chutes d'Ekom-Nkam culminent à environ 80 m au-dessus d'une forêt dense. Observation, randonnée et photo y sont les activités phares ; le site a même servi de décor de cinéma (dont Greystoke / Tarzan).",
    descriptionEn:
      "Near Melong (Moungo), Ekom-Nkam Falls drop about 80 m through dense forest. Viewing, hiking and photography are the highlights; the site has also appeared on screen (including Greystoke / Tarzan).",
    culturalInfoFr:
      "Accès payant modeste avec guides communautaires. Environs : lacs de Melong, mont Manengouba et sources thermales de Njombé.",
    culturalInfoEn:
      "Modest entry fee with community guides. Nearby: Melong lakes, Mount Manengouba and Njombé hot springs.",
    estimatedCostXaf: 3000,
    recommendedDurationHours: 3,
    bestPeriod: "Saison sèche",
    sourceNote: "Ayila'a · reformulé Visit Cameroon",
  },
  "jardin-botanique-limbe": {
    nameEn: "Limbe Botanical Garden",
    descriptionFr:
      "Créé en 1892 entre mer et Mont Cameroun, le jardin botanique de Limbé est le plus ancien du pays. Sur environ 200 ha, près de 1 000 espèces et 500 arbres se découvrent le long de pistes côtières et de biodiversité ; le Jungle Village accueille aussi des événements culturels.",
    descriptionEn:
      "Founded in 1892 between the sea and Mount Cameroon, Limbe Botanical Garden is the country's oldest. Across roughly 200 ha, about 1,000 plant species and 500 trees unfold along coastal and biodiversity trails; Jungle Village also hosts cultural events.",
    culturalInfoFr:
      "Entrée indicatrice autour de 2 000 FCFA (+ appareil photo). Prévoir anti-moustiques. À côté : Limbe Wildlife Centre et Down Beach.",
    culturalInfoEn:
      "Indicative entry around 2,000 FCFA (+ camera fee). Bring mosquito repellent. Nearby: Limbe Wildlife Centre and Down Beach.",
    estimatedCostXaf: 2000,
    recommendedDurationHours: 2,
    bestPeriod: "Toute l'année",
    sourceNote: "Ayila'a · reformulé Visit Cameroon",
  },
  "sanctuaire-primates-mefou": {
    nameEn: "Mefou Primate Sanctuary",
    descriptionFr:
      "À Mfou, à environ 45 km au sud de Yaoundé, le parc / sanctuaire de la Méfou accueille chimpanzés, gorilles et autres primates dans un cadre forestier. Ouvert en journée (souvent 8h30–16h30), c'est une sortie pédagogique très adaptée aux familles.",
    descriptionEn:
      "In Mfou, about 45 km south of Yaoundé, the Méfou park / sanctuary cares for chimpanzees, gorillas and other primates in a forest setting. Daytime opening (often 8:30–16:30) makes it a strong educational family visit.",
    culturalInfoFr:
      "Tarif souvent indiqué autour de 7 500 FCFA. Parking sur place ; restauration limitée, prévoir de l'eau.",
    culturalInfoEn:
      "Entry often listed around 7,500 FCFA. On-site parking; limited food service, bring water.",
    estimatedCostXaf: 7500,
    recommendedDurationHours: 3,
    bestPeriod: "Toute l'année",
    sourceNote: "Ayila'a · reformulé Visit Cameroon",
  },
  "parc-national-korup": {
    nameEn: "Korup National Park",
    descriptionFr:
      "Entre Eyumojock et Mundemba (Sud-Ouest), Korup est l'une des plus anciennes forêts tropicales d'Afrique (~1 260 km²). Canopée, sentiers, observation d'oiseaux et de primates : une immersion écotouristique exigeante mais exceptionnelle.",
    descriptionEn:
      "Between Eyumojock and Mundemba (South-West), Korup is one of Africa's oldest tropical forests (~1,260 km²). Canopy walks, trails, birding and primate watching: a demanding but outstanding ecotourism immersion.",
    culturalInfoFr:
      "Guides locaux recommandés. Bases logistiques à Mundemba / Kumba ; hébergements aussi du côté de Limbé pour les circuits combinés.",
    culturalInfoEn:
      "Local guides recommended. Logistics hubs in Mundemba / Kumba; Limbe stays also work for combined circuits.",
    estimatedCostXaf: 5000,
    recommendedDurationHours: 8,
    bestPeriod: "Saison sèche (déc–mars)",
    sourceNote: "Ayila'a · reformulé Visit Cameroon",
  },
  "parc-national-benoue": {
    nameEn: "Bénoué National Park",
    descriptionFr:
      "Créé en 1968 le long du fleuve Bénoué, ce grand parc de savane (~180 000 ha) abrite éléphants, lions, girafes, buffles, hippopotames et plus de 300 espèces d'oiseaux. Safaris guidés et observation ornithologique y sont les expériences phares.",
    descriptionEn:
      "Created in 1968 along the Bénoué River, this large savannah park (~180,000 ha) shelters elephants, lions, giraffes, buffalo, hippos and 300+ bird species. Guided safaris and birdwatching are the signature experiences.",
    culturalInfoFr:
      "Tarifs selon les prestations. Prévoir véhicule 4x4 et guide ; hébergement autour de Tcholliré / Ngaoundéré.",
    culturalInfoEn:
      "Fees depend on services. Plan a 4x4 and guide; lodging around Tcholliré / Ngaoundéré.",
    estimatedCostXaf: 5000,
    recommendedDurationHours: 6,
    bestPeriod: "Saison sèche (nov–avril)",
    sourceNote: "Ayila'a · reformulé Visit Cameroon",
  },
  "palais-royal-foumban": {
    nameEn: "Foumban Royal Palace",
    descriptionFr:
      "Siège du royaume Bamoun à Foumban, le palais construit en 1917 sous le sultan Ibrahim Njoya mêle influence germanique et patrimoine royal. Musée, objets rituels, manuscrits et artisanat local en font l'un des grands sites culturels du Cameroun.",
    descriptionEn:
      "Seat of the Bamoun kingdom in Foumban, the palace built in 1917 under Sultan Ibrahim Njoya blends Germanic influence with royal heritage. Museum rooms, ritual objects, manuscripts and local crafts make it a top cultural stop.",
    culturalInfoFr:
      "À combiner avec le musée royal, la mosquée centrale et, pour la nature, le mont / lac Mbapit.",
    culturalInfoEn:
      "Pair with the royal museum, the central mosque and, for nature, Mount / Lake Mbapit.",
    estimatedCostXaf: 2000,
    recommendedDurationHours: 3,
    bestPeriod: "Toute l'année",
    sourceNote: "Ayila'a · reformulé Visit Cameroon",
  },
  "chefferie-bandjoun": {
    nameEn: "Bandjoun Chiefdom",
    descriptionFr:
      "À une dizaine de kilomètres de Bafoussam, la chefferie de Bandjoun et son musée présentent symboles royaux, objets d'art et mémoire bamiléké. Cases à toiture de chaume, place cérémonielle et fêtes de décembre offrent une immersion Grassfields forte.",
    descriptionEn:
      "About 10 km from Bafoussam, Bandjoun chiefdom and its museum display royal symbols, artworks and Bamileke memory. Thatched royal compounds, ceremonial grounds and December festivals offer a strong Grassfields immersion.",
    culturalInfoFr:
      "Visites guidées thématiques ; entrée souvent autour de 1 000–2 000 FCFA. Boutiques artisanales et restaurants à proximité.",
    culturalInfoEn:
      "Themed guided tours; entry often around 1,000–2,000 FCFA. Craft shops and restaurants nearby.",
    estimatedCostXaf: 2000,
    recommendedDurationHours: 2,
    bestPeriod: "Décembre (fêtes) ou saison sèche",
    sourceNote: "Ayila'a · reformulé Visit Cameroon",
  },
  "palais-lamido-ngaoundere": {
    nameEn: "Ngaoundéré Lamido Palace",
    descriptionFr:
      "Au cœur de Ngaoundéré, le lamidat / palais du Lamido illustre l'architecture soudano-sahélienne et le pouvoir traditionnel peul. Cour, mosquée et accueil protocolaire composent une visite courte mais marquante de l'Adamaoua.",
    descriptionEn:
      "In the heart of Ngaoundéré, the Lamido's palace illustrates Sudano-Sahelian architecture and Fulani traditional authority. Courtyard, mosque and formal hospitality make a short but memorable Adamaoua visit.",
    culturalInfoFr:
      "Respecter le protocole local (tenue correcte, autorisation pour photos). Idéal en combo avec circuits vers la Bénoué.",
    culturalInfoEn:
      "Respect local protocol (appropriate dress, photo permission). Ideal combined with Bénoué circuits.",
    estimatedCostXaf: 2000,
    recommendedDurationHours: 1,
    bestPeriod: "Saison sèche",
    sourceNote: "Ayila'a · reformulé Visit Cameroon",
  },
  "lac-oku": {
    nameEn: "Lake Oku",
    descriptionFr:
      "Lac de cratère dans les montagnes du Nord-Ouest, Oku allie paysage volcanique, forêt de Kilum-Ijim et culture locale (chefferie, artisanat, miel). Une halte nature-culture idéale autour de Bamenda.",
    descriptionEn:
      "A crater lake in the North-West highlands, Oku pairs volcanic scenery, Kilum-Ijim forest and local culture (chiefdom, crafts, honey). A fine nature-culture stop near Bamenda.",
    culturalInfoFr:
      "Guides villageois utiles pour sentiers et protocoles. Climat frais : prévoir couche supplémentaire.",
    culturalInfoEn:
      "Village guides help with trails and protocol. Cool climate: bring an extra layer.",
    estimatedCostXaf: 3000,
    recommendedDurationHours: 4,
    bestPeriod: "Saison sèche",
    sourceNote: "Ayila'a / contexte local · reformulé Visit Cameroon",
  },
  "musee-national-yaounde": {
    nameEn: "National Museum of Cameroon",
    descriptionFr:
      "Installé dans l'ancien palais présidentiel près du palais de justice, le Musée national (rénové en 2015) déploie sur ~5 000 m² l'histoire politique et les cultures des dix régions : costumes, instruments, archives et pièces uniques (dont le saxophone de Manu Dibango).",
    descriptionEn:
      "Housed in the former presidential palace near the law courts, the National Museum (renovated 2015) spreads across ~5,000 m² Cameroon's political history and the cultures of all ten regions: costumes, instruments, archives and unique pieces (including Manu Dibango's saxophone).",
    culturalInfoFr:
      "Entrée souvent indiquée à partir de ~500 FCFA. Parking disponible ; pas de restauration sur place.",
    culturalInfoEn:
      "Entry often listed from ~500 FCFA. Parking available; no on-site restaurant.",
    estimatedCostXaf: 500,
    recommendedDurationHours: 2,
    bestPeriod: "Toute l'année",
    sourceNote: "Ayila'a · reformulé Visit Cameroon",
  },
  "centre-faunique-limbe": {
    nameEn: "Limbe Wildlife Centre",
    descriptionFr:
      "Le Limbe Wildlife Centre soigne et réhabilite primates et autres espèces (gorilles, chimpanzés, drills…) souvent victimes du braconnage. Visite éducative essentielle à Limbé, à combiner avec jardin botanique et plages de sable noir.",
    descriptionEn:
      "Limbe Wildlife Centre rescues and rehabilitates primates and other species (gorillas, chimpanzees, drills…) often victims of poaching. An essential educational stop in Limbe, best paired with the botanical garden and black-sand beaches.",
    culturalInfoFr:
      "Soutenir le centre via l'entrée et les dons. Photos selon règlement intérieur.",
    culturalInfoEn:
      "Support the centre via entry fees and donations. Photos per site rules.",
    estimatedCostXaf: 5000,
    recommendedDurationHours: 2,
    bestPeriod: "Toute l'année",
    sourceNote: "Ayila'a / contexte local · reformulé Visit Cameroon",
  },
  "down-beach-limbe": {
    nameEn: "Down Beach, Limbe",
    descriptionFr:
      "Plage de sable noir volcanique au cœur de Limbé : bars de poissons grillés, vue sur le Mont Cameroun et ambiance Sawa côtière. Parfaite en fin de journée après le jardin botanique ou le wildlife centre.",
    descriptionEn:
      "Volcanic black-sand beach in central Limbe: grilled-fish bars, Mount Cameroon views and coastal Sawa atmosphere. Perfect late-day stop after the botanical garden or wildlife centre.",
    culturalInfoFr:
      "Respecter les usagers locaux et la propreté du littoral. Marées et houle variables.",
    culturalInfoEn:
      "Respect local beach users and keep the shore clean. Tides and swell vary.",
    estimatedCostXaf: 0,
    recommendedDurationHours: 2,
    bestPeriod: "Saison sèche",
    sourceNote: "Contexte local · reformulé Visit Cameroon",
  },
  "mont-cameroun": {
    nameEn: "Mount Cameroon",
    descriptionFr:
      "Plus haut sommet d'Afrique de l'Ouest (~4 070 m), volcan actif dominant Buea. Treks d'un à plusieurs jours, coulées de lave et panoramas atlantiques : un défi mythique du Sud-Ouest.",
    descriptionEn:
      "West Africa's highest peak (~4,070 m), an active volcano above Buea. One- to multi-day treks, lava flows and Atlantic panoramas: a legendary South-West challenge.",
    culturalInfoFr:
      "Guides et porteur recommandés via Buea. Prévoir froid en altitude et météo changeante.",
    culturalInfoEn:
      "Guides and porters recommended via Buea. Expect cold at altitude and changing weather.",
    estimatedCostXaf: 25000,
    recommendedDurationHours: 12,
    bestPeriod: "Déc–fév (fenêtre sèche)",
    sourceNote: "Contexte local · reformulé Visit Cameroon",
  },
  "mont-febe": {
    nameEn: "Mount Fébé",
    descriptionFr:
      "Colline au nord-ouest de Yaoundé : panorama sur la capitale, basilique et espaces hôteliers. Balade courte idéale pour se situer dans la géographie urbaine Fang-Beti.",
    descriptionEn:
      "Hill northwest of Yaoundé: capital panorama, basilica and hotel grounds. A short walk that helps you read Fang-Beti urban geography.",
    culturalInfoFr:
      "Accès véhicule ou marche ; respect des lieux de culte.",
    culturalInfoEn:
      "Access by car or on foot; respect places of worship.",
    estimatedCostXaf: 0,
    recommendedDurationHours: 2,
    bestPeriod: "Toute l'année",
    sourceNote: "Contexte local · reformulé Visit Cameroon",
  },
  "cathedrale-notre-dame-yaounde": {
    nameEn: "Notre-Dame Cathedral, Yaoundé",
    descriptionFr:
      "Cathédrale Notre-Dame-des-Victoires, repère du centre-ville de Yaoundé et lieu de culte majeur. Architecture, place publique et vie paroissiale en font une halte patrimoniale facile à intégrer dans un parcours urbain.",
    descriptionEn:
      "Notre-Dame-des-Victoires Cathedral is a downtown Yaoundé landmark and major place of worship. Architecture, public square and parish life make it an easy heritage stop on a city walk.",
    culturalInfoFr:
      "Tenue correcte pendant les offices. Photos discrètes à l'intérieur.",
    culturalInfoEn:
      "Dress respectfully during services. Keep interior photos discreet.",
    estimatedCostXaf: 0,
    recommendedDurationHours: 1,
    bestPeriod: "Toute l'année",
    sourceNote: "Contexte local · reformulé Visit Cameroon",
  },
  "monument-reunification-yaounde": {
    nameEn: "Reunification Monument, Yaoundé",
    descriptionFr:
      "Monument emblématique de Yaoundé commémorant la réunification du Cameroun. Escaliers, vue urbaine et symbolique nationale : un passage classique pour comprendre le récit politique du pays.",
    descriptionEn:
      "Yaoundé's emblematic monument commemorating Cameroon's reunification. Steps, city views and national symbolism: a classic stop for the country's political story.",
    culturalInfoFr:
      "Site ouvert ; idéal en combo Musée national et centre-ville.",
    culturalInfoEn:
      "Open site; pair with the National Museum and downtown.",
    estimatedCostXaf: 0,
    recommendedDurationHours: 1,
    bestPeriod: "Toute l'année",
    sourceNote: "Contexte local · reformulé Visit Cameroon",
  },
  "palais-bafut": {
    nameEn: "Bafut Palace",
    descriptionFr:
      "Chefferie historique près de Bamenda : musée et cases royales du peuple Bafut. Architecture grassfields, objets rituels et récit dynastique pour une immersion Nord-Ouest authentique.",
    descriptionEn:
      "Historic chiefdom near Bamenda: museum and royal compounds of the Bafut people. Grassfields architecture, ritual objects and dynastic story for an authentic North-West immersion.",
    culturalInfoFr:
      "Visite guidée recommandée ; respecter les espaces sacrés.",
    culturalInfoEn:
      "Guided visit recommended; respect sacred spaces.",
    estimatedCostXaf: 2000,
    recommendedDurationHours: 2,
    bestPeriod: "Saison sèche",
    sourceNote: "Contexte local · reformulé Visit Cameroon",
  },
  "parc-national-waza": {
    nameEn: "Waza National Park",
    descriptionFr:
      "Parc emblématique de l'Extrême-Nord : savane, éléphants, girafes, antilopes et oiseaux migrateurs. L'un des meilleurs sites de safari camerounais, à vivre de préférence en saison sèche.",
    descriptionEn:
      "Flagship Far North park: savannah, elephants, giraffes, antelope and migratory birds. One of Cameroon's best safari landscapes, best experienced in the dry season.",
    culturalInfoFr:
      "Safari en véhicule avec guide. Combinable avec circuits Mandara / Rhumsiki.",
    culturalInfoEn:
      "Vehicle safari with guide. Combinable with Mandara / Rhumsiki circuits.",
    estimatedCostXaf: 10000,
    recommendedDurationHours: 6,
    bestPeriod: "Déc–avril",
    sourceNote: "Contexte local · reformulé Visit Cameroon",
  },
  "rhumsiki-pic-kapsiki": {
    nameEn: "Rhumsiki and Kapsiki Peak",
    descriptionFr:
      "Village montagnard de l'Extrême-Nord aux pics volcaniques Kapsiki : artisanat, architecture traditionnelle et panoramas Mandara. Une escale iconique du Nord sahélien.",
    descriptionEn:
      "Far North mountain village among the Kapsiki volcanic peaks: crafts, traditional architecture and Mandara panoramas. An iconic Sahelian North stop.",
    culturalInfoFr:
      "Guides locaux pour sentiers et protocoles villageois. Marchés d'artisanat sur place.",
    culturalInfoEn:
      "Local guides for trails and village protocol. Craft markets on site.",
    estimatedCostXaf: 5000,
    recommendedDurationHours: 4,
    bestPeriod: "Saison sèche",
    sourceNote: "Contexte local · reformulé Visit Cameroon",
  },
  "reserve-faune-dja": {
    nameEn: "Dja Faunal Reserve",
    descriptionFr:
      "Réserve UNESCO de forêt dense, ceinturée par la boucle de la Dja. Biodiversité exceptionnelle et écotourisme communautaire autour de Somalomo : une destination nature exigeante du Sud / Est.",
    descriptionEn:
      "UNESCO dense-forest reserve ringed by the Dja River loop. Outstanding biodiversity and community ecotourism around Somalomo: a demanding South / East nature destination.",
    culturalInfoFr:
      "Permis et guides obligatoires. Circuits multi-jours recommandés.",
    culturalInfoEn:
      "Permits and guides required. Multi-day circuits recommended.",
    estimatedCostXaf: 15000,
    recommendedDurationHours: 12,
    bestPeriod: "Saison sèche",
    sourceNote: "Contexte local · reformulé Visit Cameroon",
  },
  "plage-grand-batanga": {
    nameEn: "Grand Batanga Beach",
    descriptionFr:
      "Longue plage au sud de Kribi, villages de pêcheurs et accès pratique aux chutes de la Lobé. Ambiance plus calme que le centre-ville, idéale pour prolonger une journée océan.",
    descriptionEn:
      "Long beach south of Kribi, fishing villages and easy access to Lobé Falls. Calmer than the town centre, ideal for extending an ocean day.",
    culturalInfoFr:
      "Fruits de mer chez les riverains ; respecter les zones de pêche.",
    culturalInfoEn:
      "Seafood from local spots; respect fishing areas.",
    estimatedCostXaf: 0,
    recommendedDurationHours: 3,
    bestPeriod: "Saison sèche côtière",
    sourceNote: "Ayila'a ( Lobé / environs) · reformulé Visit Cameroon",
  },
  "bonanjo-douala": {
    nameEn: "Bonanjo, Douala",
    descriptionFr:
      "Quartier administratif et colonial de Douala : cathédrale, anciens bâtiments et art public. Point de départ pour lire l'histoire portuaire Sawa du Littoral.",
    descriptionEn:
      "Douala's administrative and colonial quarter: cathedral, historic buildings and public art. A starting point for the Littoral's Sawa port history.",
    culturalInfoFr:
      "Balade à pied ou taxi ; combiner avec la Pagode et le musée maritime si ouverts.",
    culturalInfoEn:
      "Walk or taxi; pair with the Pagoda and maritime museum when open.",
    estimatedCostXaf: 0,
    recommendedDurationHours: 2,
    bestPeriod: "Toute l'année",
    sourceNote: "Contexte local · reformulé Visit Cameroon",
  },
};
