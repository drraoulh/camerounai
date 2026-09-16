/** Country overview for Visit Cameroon (educational; verify official sources). */

export const countryFacts = {
  nameFr: "République du Cameroun",
  nameEn: "Republic of Cameroon",
  capitalFr: "Yaoundé",
  capitalEn: "Yaoundé",
  economicHubFr: "Douala",
  economicHubEn: "Douala",
  populationNoteFr: "Environ 28 millions d’habitants (ordre de grandeur).",
  populationNoteEn: "Around 28 million people (order of magnitude).",
  currency: "XAF (Franc CFA d’Afrique centrale)",
  officialLanguagesFr: ["Français", "Anglais"],
  officialLanguagesEn: ["French", "English"],
  regionsCount: 10,
  president: {
    name: "Paul Biya",
    titleFr: "Président de la République",
    titleEn: "President of the Republic",
    since: "1982",
    noteFr:
      "Chef de l’État et du pouvoir exécutif. Pour toute information officielle à jour, consultez les canaux gouvernementaux.",
    noteEn:
      "Head of State and of the executive. For up-to-date official information, consult government channels.",
  },
  governmentFr: "République unitaire décentralisée, régime présidentiel.",
  governmentEn: "Unitary decentralised republic with a presidential system.",
  independence: {
    fr: "1er janvier 1960 : indépendance du Cameroun sous tutelle française. 1er octobre 1961 : réunification avec le Cameroun méridional sous tutelle britannique.",
    en: "1 January 1960: independence of French-administered Cameroon. 1 October 1961: reunification with British Southern Cameroons.",
  },
  historyFr: [
    {
      title: "Peuples et royaumes",
      body: "Longtemps avant la colonisation, le territoire accueille des sociétés forestières, des chefferies Grassfields, des lamidats du Nord et des cultures côtières Sawa. Cette diversité reste le cœur du tourisme culturel.",
    },
    {
      title: "Colonisation et mandats",
      body: "Colonisé par l’Allemagne (Kamerun), puis placé sous mandats français et britannique après 1919. Deux administrations, deux langues officielles héritées.",
    },
    {
      title: "Indépendance et réunification",
      body: "1960–1961 : naissance de l’État moderne et réunification. Le monument de la Réunification (Buea) et les fêtes nationales rappellent cette mémoire.",
    },
    {
      title: "Cameroun d’aujourd’hui",
      body: "Dix régions, deux langues officielles, des dizaines de langues nationales. Nature (parcs, volcan, côte, forêt) et patrimoine (chefferies, lamidats, fêtes) forment l’offre Visit Cameroon.",
    },
  ],
  historyEn: [
    {
      title: "Peoples and kingdoms",
      body: "Long before colonisation, the land held forest societies, Grassfields chiefdoms, northern lamidates and coastal Sawa cultures. That diversity remains the heart of cultural tourism.",
    },
    {
      title: "Colonisation and mandates",
      body: "Colonised by Germany (Kamerun), then placed under French and British mandates after 1919 — two administrations, two official languages.",
    },
    {
      title: "Independence and reunification",
      body: "1960–1961: birth of the modern state and reunification. The Reunification Monument (Buea) and national days keep that memory alive.",
    },
    {
      title: "Cameroon today",
      body: "Ten regions, two official languages, dozens of national languages. Nature (parks, volcano, coast, forest) and heritage (chiefdoms, lamidates, festivals) shape the Visit Cameroon offer.",
    },
  ],
  symbolsFr: {
    flag: "Vert, rouge, jaune — étoile jaune au centre (unité).",
    motto: "Paix – Travail – Patrie",
    anthem: "Chant de Ralliement",
  },
  symbolsEn: {
    flag: "Green, red, yellow — yellow star at the centre (unity).",
    motto: "Peace – Work – Fatherland",
    anthem: "O Cameroon, Cradle of Our Forefathers",
  },
} as const;
