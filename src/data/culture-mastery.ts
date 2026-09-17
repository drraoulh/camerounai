import { regions } from "./regions";

export type RegionQuestion = {
  id: string;
  promptFr: string;
  promptEn: string;
  options: { id: string; labelFr: string; labelEn: string }[];
  correctId: string;
  whenFr: string;
  whenEn: string;
};

export type RegionMission = {
  regionId: string;
  questions: RegionQuestion[];
};

const o = (id: string, fr: string, en = fr) => ({
  id,
  labelFr: fr,
  labelEn: en,
});

export const regionMissions: RegionMission[] = [
  {
    regionId: "extreme-nord",
    questions: [
      {
        id: "en-1",
        promptFr: "Le grand parc safari de l’Extrême-Nord est…",
        promptEn: "The great safari park of the Far North is…",
        options: [
          o("a", "Waza"),
          o("b", "Korup"),
          o("c", "Les chutes de la Lobé", "Lobé Falls"),
          o("d", "Kribi"),
        ],
        correctId: "a",
        whenFr: "Saison sèche (déc.–avr.). Guide/pisteur obligatoire.",
        whenEn: "Dry season (Dec–Apr). Tracker required.",
      },
      {
        id: "en-2",
        promptFr: "Rhumsiki est connu pour…",
        promptEn: "Rhumsiki is known for…",
        options: [
          o("a", "Les pics et villages des Monts Mandara", "Peaks and villages of the Mandara Mountains"),
          o("b", "Le Ngondo"),
          o("c", "Le port de Douala", "Douala port"),
          o("d", "Le mont Cameroun", "Mount Cameroon"),
        ],
        correctId: "a",
        whenFr: "Architecture, habitats Mofou, lumière sahélienne.",
        whenEn: "Architecture, Mofou dwellings, Sahelian light.",
      },
      {
        id: "en-3",
        promptFr: "La base urbaine habituelle de l’Extrême-Nord est…",
        promptEn: "The usual urban base of the Far North is…",
        options: [
          o("a", "Maroua"),
          o("b", "Yaoundé"),
          o("c", "Buea"),
          o("d", "Kribi"),
        ],
        correctId: "a",
        whenFr: "De Maroua partent Waza et les Mandara.",
        whenEn: "From Maroua you reach Waza and the Mandaras.",
      },
    ],
  },
  {
    regionId: "nord",
    questions: [
      {
        id: "no-1",
        promptFr: "La grande ville-porte du Nord est…",
        promptEn: "The gateway city of the North is…",
        options: [
          o("a", "Garoua"),
          o("b", "Douala"),
          o("c", "Dschang"),
          o("d", "Limbé", "Limbe"),
        ],
        correctId: "a",
        whenFr: "Lamidats, marchés, route vers Faro et le grand Nord.",
        whenEn: "Lamidates, markets, road to Faro and the greater North.",
      },
      {
        id: "no-2",
        promptFr: "Un lamidat, c’est…",
        promptEn: "A lamidate is…",
        options: [
          o("a", "Une chefferie du Nord / Adamaoua", "A chiefdom of the North / Adamawa"),
          o("b", "Une plage", "A beach"),
          o("c", "Un festival Sawa", "A Sawa festival"),
          o("d", "Un volcan", "A volcano"),
        ],
        correctId: "a",
        whenFr: "On y entre avec respect, souvent avec un guide local.",
        whenEn: "You enter with respect, often with a local guide.",
      },
      {
        id: "no-3",
        promptFr: "Le parc souvent cité dans le Nord est…",
        promptEn: "The park often cited in the North is…",
        options: [
          o("a", "Faro"),
          o("b", "Lobé"),
          o("c", "Ngondo"),
          o("d", "Bandjoun"),
        ],
        correctId: "a",
        whenFr: "Savane, faune, complément de Waza plus au nord.",
        whenEn: "Savannah, wildlife, a complement to Waza further north.",
      },
    ],
  },
  {
    regionId: "adamaoua",
    questions: [
      {
        id: "ad-1",
        promptFr: "La ville-phare de l’Adamaoua est…",
        promptEn: "The flagship city of Adamawa is…",
        options: [
          o("a", "Ngaoundéré"),
          o("b", "Kribi"),
          o("c", "Buea"),
          o("d", "Ebolowa"),
        ],
        correctId: "a",
        whenFr: "Hauts plateaux, carrefour nord, lac Tison.",
        whenEn: "High plateaux, northern crossroads, Lake Tison.",
      },
      {
        id: "ad-2",
        promptFr: "L’Adamaoua est surtout…",
        promptEn: "Adamawa is mainly…",
        options: [
          o("a", "Des hauts plateaux de savane", "Savannah highlands"),
          o("b", "Une côte atlantique", "An Atlantic coast"),
          o("c", "La forêt du Congo seulement", "Congo forest only"),
          o("d", "Un désert de dunes", "A dune desert"),
        ],
        correctId: "a",
        whenFr: "Climat plus frais que Maroua, culture des lamidats.",
        whenEn: "Cooler than Maroua, lamidate culture.",
      },
      {
        id: "ad-3",
        promptFr: "Cette région appartient à quelle grande aire ?",
        promptEn: "This region belongs to which major area?",
        options: [
          o("a", "Soudano-sahélienne", "Sudano-Sahelian"),
          o("b", "Sawa"),
          o("c", "Fang-Beti"),
          o("d", "Grassfields uniquement", "Grassfields only"),
        ],
        correctId: "a",
        whenFr: "Avec Nord et Extrême-Nord : savane, terre, islam culturel.",
        whenEn: "With North and Far North: savannah, earth, cultural Islam.",
      },
    ],
  },
  {
    regionId: "est",
    questions: [
      {
        id: "es-1",
        promptFr: "L’Est camerounais est surtout associé à…",
        promptEn: "Cameroon’s East is mainly associated with…",
        options: [
          o("a", "La forêt du bassin du Congo", "Congo basin forest"),
          o("b", "Le Sahel", "The Sahel"),
          o("c", "Les plages de Kribi seulement", "Kribi beaches only"),
          o("d", "Le mont Cameroun", "Mount Cameroon"),
        ],
        correctId: "a",
        whenFr: "Biodiversité, peuples forestiers, tourisme prudent et guidé.",
        whenEn: "Biodiversity, forest peoples, careful guided tourism.",
      },
      {
        id: "es-2",
        promptFr: "L’Est se rattache culturellement à…",
        promptEn: "The East is culturally tied to…",
        options: [
          o("a", "Fang-Beti (et cultures forestières)", "Fang-Beti (and forest cultures)"),
          o("b", "Sawa côtier seulement", "Coastal Sawa only"),
          o("c", "Bamoun seulement", "Bamoun only"),
          o("d", "Lamidats du Faro seulement", "Faro lamidates only"),
        ],
        correctId: "a",
        whenFr: "Forêt, savoirs, langues — pas la même Côte que Douala.",
        whenEn: "Forest, knowledge, languages — not the same coast as Douala.",
      },
      {
        id: "es-3",
        promptFr: "Pour visiter l’Est, le bon réflexe est…",
        promptEn: "To visit the East, the right reflex is…",
        options: [
          o("a", "Guide local, permis, respect des communautés", "Local guide, permits, respect for communities"),
          o("b", "Safari sahélien à Waza", "Sahelian safari at Waza"),
          o("c", "Pirogues du Ngondo", "Ngondo canoes"),
          o("d", "Course du mont Cameroun", "Mount Cameroon race"),
        ],
        correctId: "a",
        whenFr: "L’aire culturelle ici, c’est la forêt habitée.",
        whenEn: "The cultural territory here is the inhabited forest.",
      },
    ],
  },
  {
    regionId: "centre",
    questions: [
      {
        id: "ce-1",
        promptFr: "La capitale Yaoundé se trouve dans…",
        promptEn: "The capital Yaoundé is in…",
        options: [
          o("a", "Le Centre", "The Centre"),
          o("b", "Le Littoral", "The Littoral"),
          o("c", "L’Extrême-Nord", "The Far North"),
          o("d", "Le Sud-Ouest", "The South-West"),
        ],
        correctId: "a",
        whenFr: "Capitale politique. Douala reste le hub économique.",
        whenEn: "Political capital. Douala remains the economic hub.",
      },
      {
        id: "ce-2",
        promptFr: "La culture Beti-Ewondo est surtout celle du…",
        promptEn: "Beti-Ewondo culture is mainly that of the…",
        options: [
          o("a", "Centre (Fang-Beti)", "Centre (Fang-Beti)"),
          o("b", "Littoral Sawa seulement", "Sawa Littoral only"),
          o("c", "Sahel", "Sahel"),
          o("d", "Mont Cameroun uniquement", "Mount Cameroon only"),
        ],
        correctId: "a",
        whenFr: "Ewondo, bikutsi, mémoire des chefferies et de Yaoundé.",
        whenEn: "Ewondo, bikutsi, memory of chiefdoms and Yaoundé.",
      },
      {
        id: "ce-3",
        promptFr: "Pour saluer en ewondo de séjour :",
        promptEn: "To greet in stay Ewondo:",
        options: [
          o("a", "Mbolo"),
          o("b", "Jam na?"),
          o("c", "Usoko"),
          o("d", "Ngondo"),
        ],
        correctId: "a",
        whenFr: "Le Centre se joue aussi dans les mots : Mbolo, Akiba, Ayei.",
        whenEn: "The Centre is also played in words: Mbolo, Akiba, Ayei.",
      },
    ],
  },
  {
    regionId: "sud",
    questions: [
      {
        id: "su-1",
        promptFr: "Kribi et les chutes de la Lobé sont dans…",
        promptEn: "Kribi and Lobé Falls are in…",
        options: [
          o("a", "Le Sud", "The South"),
          o("b", "L’Adamaoua", "Adamawa"),
          o("c", "L’Extrême-Nord", "The Far North"),
          o("d", "Le Nord-Ouest", "The North-West"),
        ],
        correctId: "a",
        whenFr: "Chutes qui rejoignent l’Atlantique — un unicum.",
        whenEn: "Falls that meet the Atlantic — a rarity.",
      },
      {
        id: "su-2",
        promptFr: "Le Sud forestier se rattache à l’aire…",
        promptEn: "The forested South belongs to the… area",
        options: [
          o("a", "Fang-Beti"),
          o("b", "Soudano-sahélienne", "Sudano-Sahelian"),
          o("c", "Grassfields seulement", "Grassfields only"),
          o("d", "Bamoun seulement", "Bamoun only"),
        ],
        correctId: "a",
        whenFr: "Ebolowa, forêt, littoral sud : même grande famille culturelle.",
        whenEn: "Ebolowa, forest, southern coast: the same cultural family.",
      },
      {
        id: "su-3",
        promptFr: "À Kribi, un classique culturel de table est…",
        promptEn: "In Kribi, a cultural table classic is…",
        options: [
          o("a", "Le poisson braisé", "Grilled fish"),
          o("b", "Le mil du Sahel seulement", "Sahel millet only"),
          o("c", "Le palais Bamoun", "Bamoun palace"),
          o("d", "Waza"),
        ],
        correctId: "a",
        whenFr: "La culture du Sud se mange aussi : mer, piment, plantain.",
        whenEn: "Southern culture is also eaten: sea, chilli, plantain.",
      },
    ],
  },
  {
    regionId: "littoral",
    questions: [
      {
        id: "li-1",
        promptFr: "Douala, capitale économique, est dans…",
        promptEn: "Douala, the economic hub, is in…",
        options: [
          o("a", "Le Littoral", "The Littoral"),
          o("b", "Le Centre", "The Centre"),
          o("c", "Le Nord", "The North"),
          o("d", "L’Est", "The East"),
        ],
        correctId: "a",
        whenFr: "Port, Wouri, culture Sawa, gastronomie de mer.",
        whenEn: "Port, Wouri, Sawa culture, seafood.",
      },
      {
        id: "li-2",
        promptFr: "Le Ngondo se tient principalement à…",
        promptEn: "Ngondo is mainly held in…",
        options: [
          o("a", "Douala (décembre)", "Douala (December)"),
          o("b", "Foumban"),
          o("c", "Maroua"),
          o("d", "Buea"),
        ],
        correctId: "a",
        whenFr: "Pirogues, jengu, kaba : l’aire Sawa en fête.",
        whenEn: "Canoes, jengu, kaba: the Sawa area in festival.",
      },
      {
        id: "li-3",
        promptFr: "La langue de séjour Sawa enseignée ici est…",
        promptEn: "The Sawa stay language taught here is…",
        options: [
          o("a", "Le duala", "Duala"),
          o("b", "Le yemba", "Yemba"),
          o("c", "Le fulfulde", "Fulfulde"),
          o("d", "L’ewondo seulement", "Ewondo only"),
        ],
        correctId: "a",
        whenFr: "Mbolo, Nandé : les mots du marché de Douala.",
        whenEn: "Mbolo, Nandé: the words of a Douala market.",
      },
    ],
  },
  {
    regionId: "ouest",
    questions: [
      {
        id: "ou-1",
        promptFr: "Foumban et le palais Bamoun sont dans…",
        promptEn: "Foumban and the Bamoun palace are in…",
        options: [
          o("a", "L’Ouest", "The West"),
          o("b", "Le Littoral", "The Littoral"),
          o("c", "L’Extrême-Nord", "The Far North"),
          o("d", "Le Sud", "The South"),
        ],
        correctId: "a",
        whenFr: "Sultanat, artisanat, écriture shü-mom, festival Nyem-Nyem.",
        whenEn: "Sultanate, crafts, shü-mom script, Nyem-Nyem festival.",
      },
      {
        id: "ou-2",
        promptFr: "Bandjoun, Bafoussam, Dschang évoquent…",
        promptEn: "Bandjoun, Bafoussam, Dschang evoke…",
        options: [
          o("a", "Les chefferies Bamiléké / Grassfields", "Bamileke chiefdoms / Grassfields"),
          o("b", "Le Ngondo"),
          o("c", "Waza"),
          o("d", "Les chutes de la Lobé", "Lobé Falls"),
        ],
        correctId: "a",
        whenFr: "Cases monumentales, musées royaux, yemba à Dschang.",
        whenEn: "Monumental halls, royal museums, Yemba in Dschang.",
      },
      {
        id: "ou-3",
        promptFr: "La langue de séjour Grassfields proposée ici est…",
        promptEn: "The Grassfields stay language offered here is…",
        options: [
          o("a", "Le yemba (Dschang / Menoua)", "Yemba (Dschang / Menoua)"),
          o("b", "Le duala seulement", "Duala only"),
          o("c", "Le fulfulde", "Fulfulde"),
          o("d", "L’anglais officiel seulement", "Official English only"),
        ],
        correctId: "a",
        whenFr: "On n’apprend pas toute la langue : salut, merci, prix.",
        whenEn: "You do not learn the whole language: hello, thanks, price.",
      },
    ],
  },
  {
    regionId: "nord-ouest",
    questions: [
      {
        id: "nw-1",
        promptFr: "Bamenda et la Ring Road sont dans…",
        promptEn: "Bamenda and the Ring Road are in…",
        options: [
          o("a", "Le Nord-Ouest", "The North-West"),
          o("b", "Le Sud", "The South"),
          o("c", "L’Est", "The East"),
          o("d", "Le Littoral", "The Littoral"),
        ],
        correctId: "a",
        whenFr: "Hautes terres Grassfields, chutes, chefferies.",
        whenEn: "Grassfields highlands, falls, chiefdoms.",
      },
      {
        id: "nw-2",
        promptFr: "Le Nord-Ouest partage l’aire…",
        promptEn: "The North-West shares the… area",
        options: [
          o("a", "Grassfields (avec l’Ouest)", "Grassfields (with the West)"),
          o("b", "Sawa"),
          o("c", "Soudano-sahélienne", "Sudano-Sahelian"),
          o("d", "Fang-Beti seulement", "Fang-Beti only"),
        ],
        correctId: "a",
        whenFr: "Même famille de chefferies, autre versant linguistique (souvent anglais + langues locales).",
        whenEn: "The same chiefdom family, another linguistic slope (often English + local languages).",
      },
      {
        id: "nw-3",
        promptFr: "Pour un séjour au Nord-Ouest, le bon réflexe culturel est…",
        promptEn: "For a North-West stay, the right cultural reflex is…",
        options: [
          o("a", "Saluer, demander un guide local, respecter les chefferies", "Greet, ask for a local guide, respect chiefdoms"),
          o("b", "Ignorer les autorités traditionnelles", "Ignore traditional authorities"),
          o("c", "Confondre avec Waza", "Confuse it with Waza"),
          o("d", "Chercher le Ngondo", "Look for Ngondo"),
        ],
        correctId: "a",
        whenFr: "L’aire se complète avec l’Ouest : deux régions, une grande culture Grassfields.",
        whenEn: "The area is completed by the West: two regions, one Grassfields culture.",
      },
    ],
  },
  {
    regionId: "sud-ouest",
    questions: [
      {
        id: "sw-1",
        promptFr: "Buea et le mont Cameroun sont dans…",
        promptEn: "Buea and Mount Cameroon are in…",
        options: [
          o("a", "Le Sud-Ouest", "The South-West"),
          o("b", "L’Extrême-Nord", "The Far North"),
          o("c", "L’Adamaoua", "Adamawa"),
          o("d", "L’Est", "The East"),
        ],
        correctId: "a",
        whenFr: "Volcan, Course de l’Espoir, culture bakweri.",
        whenEn: "Volcano, Race of Hope, Bakweri culture.",
      },
      {
        id: "sw-2",
        promptFr: "Limbé (Limbe) est connu pour…",
        promptEn: "Limbe is known for…",
        options: [
          o("a", "La côte, le Wildlife Centre, l’identité côtière Sawa", "The coast, the Wildlife Centre, Sawa coastal identity"),
          o("b", "Le palais Bamoun", "Bamoun palace"),
          o("c", "Waza"),
          o("d", "Le bikutsi de Yaoundé", "Yaoundé bikutsi"),
        ],
        correctId: "a",
        whenFr: "Le Sud-Ouest prolonge l’aire Sawa avec le volcan.",
        whenEn: "The South-West extends the Sawa area with the volcano.",
      },
      {
        id: "sw-3",
        promptFr: "Le monument de la Réunification est associé à…",
        promptEn: "The Reunification monument is associated with…",
        options: [
          o("a", "Buea (mémoire 1961)", "Buea (1961 memory)"),
          o("b", "Maroua"),
          o("c", "Kribi seulement", "Kribi only"),
          o("d", "Foumban seulement", "Foumban only"),
        ],
        correctId: "a",
        whenFr: "1960–1961 : indépendance et réunification. Une aire culturelle, une histoire nationale.",
        whenEn: "1960–1961: independence and reunification. A cultural territory, a national history.",
      },
    ],
  },
];

export function regionMission(regionId: string) {
  return regionMissions.find((m) => m.regionId === regionId);
}

export const CULTURE_REGION_IDS = regions.map((r) => r.id);
