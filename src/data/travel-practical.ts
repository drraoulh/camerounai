/** Pre-arrival practical info. Always verify with embassies / WHO / airlines. */

export type TipBlock = {
  id: string;
  titleFr: string;
  titleEn: string;
  bodyFr: string;
  bodyEn: string;
};

export const formalities: TipBlock[] = [
  {
    id: "passport",
    titleFr: "Passeport",
    titleEn: "Passport",
    bodyFr:
      "Passeport valide recommandé (souvent 6 mois après la date de retour). Vérifiez les règles exactes selon votre nationalité.",
    bodyEn:
      "A valid passport is recommended (often 6 months beyond return). Check exact rules for your nationality.",
  },
  {
    id: "visa",
    titleFr: "Visa & entrée",
    titleEn: "Visa & entry",
    bodyFr:
      "De nombreux voyageurs ont besoin d’un visa. Renseignez-vous auprès de l’ambassade / consulat du Cameroun ou des procédures e-visa officielles. Les conditions changent : ne vous fiez pas uniquement à un site touristique.",
    bodyEn:
      "Many travellers need a visa. Check with a Cameroon embassy/consulate or official e-visa channels. Rules change — do not rely only on a tourism site.",
  },
  {
    id: "arrival",
    titleFr: "À l’arrivée",
    titleEn: "On arrival",
    bodyFr:
      "Gardez billets, réservations d’hôtel et preuves de fonds accessibles. Déclarez devises selon les règles en vigueur. Préférez taxis / transferts d’hôtel connus la nuit.",
    bodyEn:
      "Keep tickets, hotel bookings and proof of funds handy. Declare currency as required. Prefer known hotel transfers or taxis at night.",
  },
];

export const healthTips: TipBlock[] = [
  {
    id: "vaccines",
    titleFr: "Vaccinations",
    titleEn: "Vaccinations",
    bodyFr:
      "La fièvre jaune est souvent exigée selon votre trajet. Autres vaccins (hépatite A/B, typhoïde, etc.) selon votre médecin. Consultez un centre de vaccination internationale avant le départ.",
    bodyEn:
      "Yellow fever is often required depending on your itinerary. Other vaccines (hepatitis A/B, typhoid, etc.) depend on your doctor. Visit a travel clinic before departure.",
  },
  {
    id: "malaria",
    titleFr: "Paludisme",
    titleEn: "Malaria",
    bodyFr:
      "Risque présent dans une grande partie du pays. Demandez un traitement prophylactique adapté, utilisez répulsif et moustiquaire, surtout en soirée.",
    bodyEn:
      "Risk exists across much of the country. Ask for suitable prophylaxis, use repellent and a mosquito net, especially in the evening.",
  },
  {
    id: "water",
    titleFr: "Eau & alimentation",
    titleEn: "Water & food",
    bodyFr:
      "Privilégiez eau embouteillée ou filtrée. Choisissez restaurants fréquentés ; soyez prudent avec les glaçons et fruits non pelés.",
    bodyEn:
      "Prefer bottled or filtered water. Choose busy restaurants; be careful with ice and unpeeled fruit.",
  },
  {
    id: "insurance",
    titleFr: "Assurance",
    titleEn: "Insurance",
    bodyFr:
      "Souscrivez une assurance voyage couvrant soins et rapatriement. Emportez une trousse de base et vos ordonnances.",
    bodyEn:
      "Get travel insurance covering care and repatriation. Pack a basic kit and your prescriptions.",
  },
];

export type TransportHub = {
  id: string;
  kind: "airport" | "rail" | "bus";
  nameFr: string;
  nameEn: string;
  city: string;
  code?: string;
  noteFr: string;
  noteEn: string;
};

export const hubs: TransportHub[] = [
  {
    id: "dla",
    kind: "airport",
    nameFr: "Aéroport international de Douala",
    nameEn: "Douala International Airport",
    city: "Douala",
    code: "DLA",
    noteFr: "Principale porte d’entrée internationale et hub économique.",
    noteEn: "Main international gateway and economic hub.",
  },
  {
    id: "nsi",
    kind: "airport",
    nameFr: "Aéroport international de Yaoundé-Nsimalen",
    nameEn: "Yaoundé-Nsimalen International Airport",
    city: "Yaoundé",
    code: "NSI",
    noteFr: "Aéroport de la capitale politique ; vols internationaux et domestiques.",
    noteEn: "Capital city airport; international and domestic flights.",
  },
  {
    id: "gou",
    kind: "airport",
    nameFr: "Aéroport de Garoua",
    nameEn: "Garoua Airport",
    city: "Garoua",
    code: "GOU",
    noteFr: "Porte d’accès au grand Nord (vols domestiques selon saisons).",
    noteEn: "Gateway to the greater North (domestic flights, seasonal).",
  },
  {
    id: "mvr",
    kind: "airport",
    nameFr: "Aéroport de Maroua-Salak",
    nameEn: "Maroua-Salak Airport",
    city: "Maroua",
    code: "MVR",
    noteFr: "Accès Extrême-Nord (Waza, Mandara) selon disponibilités.",
    noteEn: "Access to the Far North (Waza, Mandara) when flights run.",
  },
  {
    id: "bfc",
    kind: "airport",
    nameFr: "Aéroport de Bafoussam",
    nameEn: "Bafoussam Airport",
    city: "Bafoussam",
    code: "BPC",
    noteFr: "Utile pour l’Ouest et les Grassfields (vols domestiques).",
    noteEn: "Useful for the West and Grassfields (domestic flights).",
  },
  {
    id: "rail-dla-yde",
    kind: "rail",
    nameFr: "Gare Camrail Douala ↔ Yaoundé",
    nameEn: "Camrail Douala ↔ Yaoundé",
    city: "Douala / Yaoundé",
    noteFr:
      "Train de nuit / jour selon horaires Camrail. Réservez à l’avance ; confirmez les horaires avant le départ.",
    noteEn:
      "Day/night trains depending on Camrail schedules. Book ahead; confirm times before travel.",
  },
  {
    id: "rail-nga",
    kind: "rail",
    nameFr: "Ligne vers Ngaoundéré",
    nameEn: "Line toward Ngaoundéré",
    city: "Ngaoundéré",
    noteFr:
      "Liaison ferroviaire vers l’Adamaoua / grand Nord. Trajet long : prévoyez eau, collations et patience.",
    noteEn:
      "Rail link toward Adamawa / the greater North. Long journey — bring water, snacks and patience.",
  },
  {
    id: "bus-dla",
    kind: "bus",
    nameFr: "Gares routières de Douala",
    nameEn: "Douala bus stations",
    city: "Douala",
    noteFr:
      "Départs vers Yaoundé, Ouest, Sud-Ouest, etc. Préférez compagnies connues (confort / VIP) et gares officielles.",
    noteEn:
      "Departures to Yaoundé, West, South-West, etc. Prefer known (VIP/comfort) companies and official stations.",
  },
  {
    id: "bus-yde",
    kind: "bus",
    nameFr: "Gares routières de Yaoundé",
    nameEn: "Yaoundé bus stations",
    city: "Yaoundé",
    noteFr:
      "Liaisons vers Douala, Est, Sud, Adamaoua. Évitez les pick-up improvisés ; gardez bagages sous surveillance.",
    noteEn:
      "Links to Douala, East, South, Adamawa. Avoid informal pick-ups; watch your luggage.",
  },
  {
    id: "bus-baf",
    kind: "bus",
    nameFr: "Gares de Bafoussam / Bamenda",
    nameEn: "Bafoussam / Bamenda stations",
    city: "Bafoussam · Bamenda",
    noteFr: "Nœuds pour les Grassfields et le Nord-Ouest (Ring Road).",
    noteEn: "Hubs for the Grassfields and North-West (Ring Road).",
  },
];

export const moreTips: TipBlock[] = [
  {
    id: "money",
    titleFr: "Monnaie",
    titleEn: "Currency",
    bodyFr:
      "Franc CFA (XAF). Espèces utiles hors grandes villes ; cartes dans hôtels et centres urbains. Changez dans des bureaux / banques connus.",
    bodyEn:
      "CFA franc (XAF). Cash is useful outside big cities; cards work in hotels and urban centres. Change money at known bureaux/banks.",
  },
  {
    id: "season",
    titleFr: "Meilleure période",
    titleEn: "Best time",
    bodyFr:
      "Saison sèche (nov.–mars) pour safaris et plages. Pluies plus fréquentes d’avril à octobre selon la région.",
    bodyEn:
      "Dry season (Nov–Mar) for safaris and beaches. Rain is more likely April–October depending on the region.",
  },
  {
    id: "responsible",
    titleFr: "Voyage responsable",
    titleEn: "Responsible travel",
    bodyFr:
      "Guides locaux, respect des parcs et des communautés, artisanat authentique. Demandez toujours le consentement avant de photographier.",
    bodyEn:
      "Local guides, respect for parks and communities, genuine crafts. Always ask before photographing people.",
  },
];
