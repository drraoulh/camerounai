-- Reformulated descriptions from Ayila'a + Visit Cameroon editorial
-- Run in Supabase SQL editor. Images will be added later.

UPDATE places SET
  description_fr = 'À environ 7 km du centre de Kribi, les chutes de la Lobé offrent un spectacle rare : le fleuve se jette directement dans l''océan Atlantique. Pirogues, baignade, fruits de mer et rencontres avec les communautés riveraines composent une sortie accessible à tous les âges.',
  description_en = 'About 7 km from central Kribi, the Lobé Falls are a rare sight: the river plunges straight into the Atlantic. Canoe rides, swimming, seafood and meetings with riverside communities make it a family-friendly outing.',
  cultural_info_fr = 'Les guides locaux proposent des balades en pirogue au pied des cascades. À proximité : Grand Batanga, le phare de Kribi et le Lagon Bleu.',
  cultural_info_en = 'Local guides offer canoe trips at the foot of the falls. Nearby: Grand Batanga, Kribi lighthouse and the Blue Lagoon.',
  estimated_cost_xaf = 5000,
  recommended_duration_hours = 3,
  best_period = 'Nov–Mai (saison sèche côtière)',
  updated_at = now()
WHERE slug = 'chutes-de-la-lobe';

UPDATE places SET
  description_fr = 'Près de Melong (Moungo), les chutes d''Ekom-Nkam culminent à environ 80 m au-dessus d''une forêt dense. Observation, randonnée et photo y sont les activités phares ; le site a même servi de décor de cinéma (dont Greystoke / Tarzan).',
  description_en = 'Near Melong (Moungo), Ekom-Nkam Falls drop about 80 m through dense forest. Viewing, hiking and photography are the highlights; the site has also appeared on screen (including Greystoke / Tarzan).',
  cultural_info_fr = 'Accès payant modeste avec guides communautaires. Environs : lacs de Melong, mont Manengouba et sources thermales de Njombé.',
  cultural_info_en = 'Modest entry fee with community guides. Nearby: Melong lakes, Mount Manengouba and Njombé hot springs.',
  estimated_cost_xaf = 3000,
  recommended_duration_hours = 3,
  best_period = 'Saison sèche',
  updated_at = now()
WHERE slug = 'chutes-ekom-nkam';

UPDATE places SET
  description_fr = 'Créé en 1892 entre mer et Mont Cameroun, le jardin botanique de Limbé est le plus ancien du pays. Sur environ 200 ha, près de 1 000 espèces et 500 arbres se découvrent le long de pistes côtières et de biodiversité ; le Jungle Village accueille aussi des événements culturels.',
  description_en = 'Founded in 1892 between the sea and Mount Cameroon, Limbe Botanical Garden is the country''s oldest. Across roughly 200 ha, about 1,000 plant species and 500 trees unfold along coastal and biodiversity trails; Jungle Village also hosts cultural events.',
  cultural_info_fr = 'Entrée indicatrice autour de 2 000 FCFA (+ appareil photo). Prévoir anti-moustiques. À côté : Limbe Wildlife Centre et Down Beach.',
  cultural_info_en = 'Indicative entry around 2,000 FCFA (+ camera fee). Bring mosquito repellent. Nearby: Limbe Wildlife Centre and Down Beach.',
  estimated_cost_xaf = 2000,
  recommended_duration_hours = 2,
  best_period = 'Toute l''année',
  updated_at = now()
WHERE slug = 'jardin-botanique-limbe';

UPDATE places SET
  description_fr = 'À Mfou, à environ 45 km au sud de Yaoundé, le parc / sanctuaire de la Méfou accueille chimpanzés, gorilles et autres primates dans un cadre forestier. Ouvert en journée (souvent 8h30–16h30), c''est une sortie pédagogique très adaptée aux familles.',
  description_en = 'In Mfou, about 45 km south of Yaoundé, the Méfou park / sanctuary cares for chimpanzees, gorillas and other primates in a forest setting. Daytime opening (often 8:30–16:30) makes it a strong educational family visit.',
  cultural_info_fr = 'Tarif souvent indiqué autour de 7 500 FCFA. Parking sur place ; restauration limitée, prévoir de l''eau.',
  cultural_info_en = 'Entry often listed around 7,500 FCFA. On-site parking; limited food service, bring water.',
  estimated_cost_xaf = 7500,
  recommended_duration_hours = 3,
  best_period = 'Toute l''année',
  updated_at = now()
WHERE slug = 'sanctuaire-primates-mefou';

UPDATE places SET
  description_fr = 'Entre Eyumojock et Mundemba (Sud-Ouest), Korup est l''une des plus anciennes forêts tropicales d''Afrique (~1 260 km²). Canopée, sentiers, observation d''oiseaux et de primates : une immersion écotouristique exigeante mais exceptionnelle.',
  description_en = 'Between Eyumojock and Mundemba (South-West), Korup is one of Africa''s oldest tropical forests (~1,260 km²). Canopy walks, trails, birding and primate watching: a demanding but outstanding ecotourism immersion.',
  cultural_info_fr = 'Guides locaux recommandés. Bases logistiques à Mundemba / Kumba ; hébergements aussi du côté de Limbé pour les circuits combinés.',
  cultural_info_en = 'Local guides recommended. Logistics hubs in Mundemba / Kumba; Limbe stays also work for combined circuits.',
  estimated_cost_xaf = 5000,
  recommended_duration_hours = 8,
  best_period = 'Saison sèche (déc–mars)',
  updated_at = now()
WHERE slug = 'parc-national-korup';

UPDATE places SET
  description_fr = 'Créé en 1968 le long du fleuve Bénoué, ce grand parc de savane (~180 000 ha) abrite éléphants, lions, girafes, buffles, hippopotames et plus de 300 espèces d''oiseaux. Safaris guidés et observation ornithologique y sont les expériences phares.',
  description_en = 'Created in 1968 along the Bénoué River, this large savannah park (~180,000 ha) shelters elephants, lions, giraffes, buffalo, hippos and 300+ bird species. Guided safaris and birdwatching are the signature experiences.',
  cultural_info_fr = 'Tarifs selon les prestations. Prévoir véhicule 4x4 et guide ; hébergement autour de Tcholliré / Ngaoundéré.',
  cultural_info_en = 'Fees depend on services. Plan a 4x4 and guide; lodging around Tcholliré / Ngaoundéré.',
  estimated_cost_xaf = 5000,
  recommended_duration_hours = 6,
  best_period = 'Saison sèche (nov–avril)',
  updated_at = now()
WHERE slug = 'parc-national-benoue';

UPDATE places SET
  description_fr = 'Siège du royaume Bamoun à Foumban, le palais construit en 1917 sous le sultan Ibrahim Njoya mêle influence germanique et patrimoine royal. Musée, objets rituels, manuscrits et artisanat local en font l''un des grands sites culturels du Cameroun.',
  description_en = 'Seat of the Bamoun kingdom in Foumban, the palace built in 1917 under Sultan Ibrahim Njoya blends Germanic influence with royal heritage. Museum rooms, ritual objects, manuscripts and local crafts make it a top cultural stop.',
  cultural_info_fr = 'À combiner avec le musée royal, la mosquée centrale et, pour la nature, le mont / lac Mbapit.',
  cultural_info_en = 'Pair with the royal museum, the central mosque and, for nature, Mount / Lake Mbapit.',
  estimated_cost_xaf = 2000,
  recommended_duration_hours = 3,
  best_period = 'Toute l''année',
  updated_at = now()
WHERE slug = 'palais-royal-foumban';

UPDATE places SET
  description_fr = 'À une dizaine de kilomètres de Bafoussam, la chefferie de Bandjoun et son musée présentent symboles royaux, objets d''art et mémoire bamiléké. Cases à toiture de chaume, place cérémonielle et fêtes de décembre offrent une immersion Grassfields forte.',
  description_en = 'About 10 km from Bafoussam, Bandjoun chiefdom and its museum display royal symbols, artworks and Bamileke memory. Thatched royal compounds, ceremonial grounds and December festivals offer a strong Grassfields immersion.',
  cultural_info_fr = 'Visites guidées thématiques ; entrée souvent autour de 1 000–2 000 FCFA. Boutiques artisanales et restaurants à proximité.',
  cultural_info_en = 'Themed guided tours; entry often around 1,000–2,000 FCFA. Craft shops and restaurants nearby.',
  estimated_cost_xaf = 2000,
  recommended_duration_hours = 2,
  best_period = 'Décembre (fêtes) ou saison sèche',
  updated_at = now()
WHERE slug = 'chefferie-bandjoun';

UPDATE places SET
  description_fr = 'Au cœur de Ngaoundéré, le lamidat / palais du Lamido illustre l''architecture soudano-sahélienne et le pouvoir traditionnel peul. Cour, mosquée et accueil protocolaire composent une visite courte mais marquante de l''Adamaoua.',
  description_en = 'In the heart of Ngaoundéré, the Lamido''s palace illustrates Sudano-Sahelian architecture and Fulani traditional authority. Courtyard, mosque and formal hospitality make a short but memorable Adamaoua visit.',
  cultural_info_fr = 'Respecter le protocole local (tenue correcte, autorisation pour photos). Idéal en combo avec circuits vers la Bénoué.',
  cultural_info_en = 'Respect local protocol (appropriate dress, photo permission). Ideal combined with Bénoué circuits.',
  estimated_cost_xaf = 2000,
  recommended_duration_hours = 1,
  best_period = 'Saison sèche',
  updated_at = now()
WHERE slug = 'palais-lamido-ngaoundere';

UPDATE places SET
  description_fr = 'Lac de cratère dans les montagnes du Nord-Ouest, Oku allie paysage volcanique, forêt de Kilum-Ijim et culture locale (chefferie, artisanat, miel). Une halte nature-culture idéale autour de Bamenda.',
  description_en = 'A crater lake in the North-West highlands, Oku pairs volcanic scenery, Kilum-Ijim forest and local culture (chiefdom, crafts, honey). A fine nature-culture stop near Bamenda.',
  cultural_info_fr = 'Guides villageois utiles pour sentiers et protocoles. Climat frais : prévoir couche supplémentaire.',
  cultural_info_en = 'Village guides help with trails and protocol. Cool climate: bring an extra layer.',
  estimated_cost_xaf = 3000,
  recommended_duration_hours = 4,
  best_period = 'Saison sèche',
  updated_at = now()
WHERE slug = 'lac-oku';

UPDATE places SET
  description_fr = 'Installé dans l''ancien palais présidentiel près du palais de justice, le Musée national (rénové en 2015) déploie sur ~5 000 m² l''histoire politique et les cultures des dix régions : costumes, instruments, archives et pièces uniques (dont le saxophone de Manu Dibango).',
  description_en = 'Housed in the former presidential palace near the law courts, the National Museum (renovated 2015) spreads across ~5,000 m² Cameroon''s political history and the cultures of all ten regions: costumes, instruments, archives and unique pieces (including Manu Dibango''s saxophone).',
  cultural_info_fr = 'Entrée souvent indiquée à partir de ~500 FCFA. Parking disponible ; pas de restauration sur place.',
  cultural_info_en = 'Entry often listed from ~500 FCFA. Parking available; no on-site restaurant.',
  estimated_cost_xaf = 500,
  recommended_duration_hours = 2,
  best_period = 'Toute l''année',
  updated_at = now()
WHERE slug = 'musee-national-yaounde';

UPDATE places SET
  description_fr = 'Le Limbe Wildlife Centre soigne et réhabilite primates et autres espèces (gorilles, chimpanzés, drills…) souvent victimes du braconnage. Visite éducative essentielle à Limbé, à combiner avec jardin botanique et plages de sable noir.',
  description_en = 'Limbe Wildlife Centre rescues and rehabilitates primates and other species (gorillas, chimpanzees, drills…) often victims of poaching. An essential educational stop in Limbe, best paired with the botanical garden and black-sand beaches.',
  cultural_info_fr = 'Soutenir le centre via l''entrée et les dons. Photos selon règlement intérieur.',
  cultural_info_en = 'Support the centre via entry fees and donations. Photos per site rules.',
  estimated_cost_xaf = 5000,
  recommended_duration_hours = 2,
  best_period = 'Toute l''année',
  updated_at = now()
WHERE slug = 'centre-faunique-limbe';

UPDATE places SET
  description_fr = 'Plage de sable noir volcanique au cœur de Limbé : bars de poissons grillés, vue sur le Mont Cameroun et ambiance Sawa côtière. Parfaite en fin de journée après le jardin botanique ou le wildlife centre.',
  description_en = 'Volcanic black-sand beach in central Limbe: grilled-fish bars, Mount Cameroon views and coastal Sawa atmosphere. Perfect late-day stop after the botanical garden or wildlife centre.',
  cultural_info_fr = 'Respecter les usagers locaux et la propreté du littoral. Marées et houle variables.',
  cultural_info_en = 'Respect local beach users and keep the shore clean. Tides and swell vary.',
  estimated_cost_xaf = 0,
  recommended_duration_hours = 2,
  best_period = 'Saison sèche',
  updated_at = now()
WHERE slug = 'down-beach-limbe';

UPDATE places SET
  description_fr = 'Plus haut sommet d''Afrique de l''Ouest (~4 070 m), volcan actif dominant Buea. Treks d''un à plusieurs jours, coulées de lave et panoramas atlantiques : un défi mythique du Sud-Ouest.',
  description_en = 'West Africa''s highest peak (~4,070 m), an active volcano above Buea. One- to multi-day treks, lava flows and Atlantic panoramas: a legendary South-West challenge.',
  cultural_info_fr = 'Guides et porteur recommandés via Buea. Prévoir froid en altitude et météo changeante.',
  cultural_info_en = 'Guides and porters recommended via Buea. Expect cold at altitude and changing weather.',
  estimated_cost_xaf = 25000,
  recommended_duration_hours = 12,
  best_period = 'Déc–fév (fenêtre sèche)',
  updated_at = now()
WHERE slug = 'mont-cameroun';

UPDATE places SET
  description_fr = 'Colline au nord-ouest de Yaoundé : panorama sur la capitale, basilique et espaces hôteliers. Balade courte idéale pour se situer dans la géographie urbaine Fang-Beti.',
  description_en = 'Hill northwest of Yaoundé: capital panorama, basilica and hotel grounds. A short walk that helps you read Fang-Beti urban geography.',
  cultural_info_fr = 'Accès véhicule ou marche ; respect des lieux de culte.',
  cultural_info_en = 'Access by car or on foot; respect places of worship.',
  estimated_cost_xaf = 0,
  recommended_duration_hours = 2,
  best_period = 'Toute l''année',
  updated_at = now()
WHERE slug = 'mont-febe';

UPDATE places SET
  description_fr = 'Cathédrale Notre-Dame-des-Victoires, repère du centre-ville de Yaoundé et lieu de culte majeur. Architecture, place publique et vie paroissiale en font une halte patrimoniale facile à intégrer dans un parcours urbain.',
  description_en = 'Notre-Dame-des-Victoires Cathedral is a downtown Yaoundé landmark and major place of worship. Architecture, public square and parish life make it an easy heritage stop on a city walk.',
  cultural_info_fr = 'Tenue correcte pendant les offices. Photos discrètes à l''intérieur.',
  cultural_info_en = 'Dress respectfully during services. Keep interior photos discreet.',
  estimated_cost_xaf = 0,
  recommended_duration_hours = 1,
  best_period = 'Toute l''année',
  updated_at = now()
WHERE slug = 'cathedrale-notre-dame-yaounde';

UPDATE places SET
  description_fr = 'Monument emblématique de Yaoundé commémorant la réunification du Cameroun. Escaliers, vue urbaine et symbolique nationale : un passage classique pour comprendre le récit politique du pays.',
  description_en = 'Yaoundé''s emblematic monument commemorating Cameroon''s reunification. Steps, city views and national symbolism: a classic stop for the country''s political story.',
  cultural_info_fr = 'Site ouvert ; idéal en combo Musée national et centre-ville.',
  cultural_info_en = 'Open site; pair with the National Museum and downtown.',
  estimated_cost_xaf = 0,
  recommended_duration_hours = 1,
  best_period = 'Toute l''année',
  updated_at = now()
WHERE slug = 'monument-reunification-yaounde';

UPDATE places SET
  description_fr = 'Chefferie historique près de Bamenda : musée et cases royales du peuple Bafut. Architecture grassfields, objets rituels et récit dynastique pour une immersion Nord-Ouest authentique.',
  description_en = 'Historic chiefdom near Bamenda: museum and royal compounds of the Bafut people. Grassfields architecture, ritual objects and dynastic story for an authentic North-West immersion.',
  cultural_info_fr = 'Visite guidée recommandée ; respecter les espaces sacrés.',
  cultural_info_en = 'Guided visit recommended; respect sacred spaces.',
  estimated_cost_xaf = 2000,
  recommended_duration_hours = 2,
  best_period = 'Saison sèche',
  updated_at = now()
WHERE slug = 'palais-bafut';

UPDATE places SET
  description_fr = 'Parc emblématique de l''Extrême-Nord : savane, éléphants, girafes, antilopes et oiseaux migrateurs. L''un des meilleurs sites de safari camerounais, à vivre de préférence en saison sèche.',
  description_en = 'Flagship Far North park: savannah, elephants, giraffes, antelope and migratory birds. One of Cameroon''s best safari landscapes, best experienced in the dry season.',
  cultural_info_fr = 'Safari en véhicule avec guide. Combinable avec circuits Mandara / Rhumsiki.',
  cultural_info_en = 'Vehicle safari with guide. Combinable with Mandara / Rhumsiki circuits.',
  estimated_cost_xaf = 10000,
  recommended_duration_hours = 6,
  best_period = 'Déc–avril',
  updated_at = now()
WHERE slug = 'parc-national-waza';

UPDATE places SET
  description_fr = 'Village montagnard de l''Extrême-Nord aux pics volcaniques Kapsiki : artisanat, architecture traditionnelle et panoramas Mandara. Une escale iconique du Nord sahélien.',
  description_en = 'Far North mountain village among the Kapsiki volcanic peaks: crafts, traditional architecture and Mandara panoramas. An iconic Sahelian North stop.',
  cultural_info_fr = 'Guides locaux pour sentiers et protocoles villageois. Marchés d''artisanat sur place.',
  cultural_info_en = 'Local guides for trails and village protocol. Craft markets on site.',
  estimated_cost_xaf = 5000,
  recommended_duration_hours = 4,
  best_period = 'Saison sèche',
  updated_at = now()
WHERE slug = 'rhumsiki-pic-kapsiki';

UPDATE places SET
  description_fr = 'Réserve UNESCO de forêt dense, ceinturée par la boucle de la Dja. Biodiversité exceptionnelle et écotourisme communautaire autour de Somalomo : une destination nature exigeante du Sud / Est.',
  description_en = 'UNESCO dense-forest reserve ringed by the Dja River loop. Outstanding biodiversity and community ecotourism around Somalomo: a demanding South / East nature destination.',
  cultural_info_fr = 'Permis et guides obligatoires. Circuits multi-jours recommandés.',
  cultural_info_en = 'Permits and guides required. Multi-day circuits recommended.',
  estimated_cost_xaf = 15000,
  recommended_duration_hours = 12,
  best_period = 'Saison sèche',
  updated_at = now()
WHERE slug = 'reserve-faune-dja';

UPDATE places SET
  description_fr = 'Longue plage au sud de Kribi, villages de pêcheurs et accès pratique aux chutes de la Lobé. Ambiance plus calme que le centre-ville, idéale pour prolonger une journée océan.',
  description_en = 'Long beach south of Kribi, fishing villages and easy access to Lobé Falls. Calmer than the town centre, ideal for extending an ocean day.',
  cultural_info_fr = 'Fruits de mer chez les riverains ; respecter les zones de pêche.',
  cultural_info_en = 'Seafood from local spots; respect fishing areas.',
  estimated_cost_xaf = 0,
  recommended_duration_hours = 3,
  best_period = 'Saison sèche côtière',
  updated_at = now()
WHERE slug = 'plage-grand-batanga';

UPDATE places SET
  description_fr = 'Quartier administratif et colonial de Douala : cathédrale, anciens bâtiments et art public. Point de départ pour lire l''histoire portuaire Sawa du Littoral.',
  description_en = 'Douala''s administrative and colonial quarter: cathedral, historic buildings and public art. A starting point for the Littoral''s Sawa port history.',
  cultural_info_fr = 'Balade à pied ou taxi ; combiner avec la Pagode et le musée maritime si ouverts.',
  cultural_info_en = 'Walk or taxi; pair with the Pagoda and maritime museum when open.',
  estimated_cost_xaf = 0,
  recommended_duration_hours = 2,
  best_period = 'Toute l''année',
  updated_at = now()
WHERE slug = 'bonanjo-douala';
