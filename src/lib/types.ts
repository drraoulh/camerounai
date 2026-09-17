export type Locale = "fr" | "en";

export type DestinationCategory =
  | "patrimoine"
  | "musee"
  | "monument"
  | "parc"
  | "reserve"
  | "plage"
  | "cascade"
  | "montagne"
  | "artisanat"
  | "gastronomie"
  | "festival"
  | "activite"
  | "hebergement"
  | "restauration";

export type CulturalZone =
  | "Grassfields"
  | "Sawa"
  | "Fang-Beti"
  | "Sudano-Sahelian";

export interface Destination {
  id: string;
  name: string;
  nameEn: string;
  region: string;
  /** English region label (e.g. Far North); falls back to `region` in UI helpers. */
  regionEn: string;
  city: string;
  /** English city label when it differs (e.g. Limbe); otherwise same as `city`. */
  cityEn: string;
  department: string;
  culturalZone: CulturalZone;
  category: DestinationCategory;
  descriptionFr: string;
  descriptionEn: string;
  lat: number;
  lng: number;
  activities: string[];
  estimatedCostFcfa: number;
  recommendedDurationHours: number;
  bestPeriod: string;
  culturalInfoFr: string;
  culturalInfoEn: string;
  ecoTags: string[];
  communityActivities: string[];
  localGuide: boolean;
  image: string;
  source: string;
  verifiedAt: string;
}

export interface Expression {
  id: string;
  language: string;
  phrase: string;
  translationFr: string;
  translationEn: string;
  pronunciation: string;
  contextFr: string;
  contextEn: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TripRequest {
  destination: string;
  days: number;
  budgetFcfa: number;
  people: number;
  interests: string[];
  /** solo | couple | family | friends | group — inferred if omitted */
  travelType?: string;
  /** economy | standard | comfort | premium — inferred from budget if omitted */
  hotelTier?: string;
  locale?: Locale;
}

export type TripActivityKind =
  | "nature"
  | "culture"
  | "visit"
  | "restaurant"
  | "hotel"
  | "transport";

export type HotelTier = "economy" | "standard" | "comfort" | "premium";
export type PartyStyle = "solo" | "couple" | "family" | "friends" | "group";

export interface TripPreferences {
  hotelTier: HotelTier;
  partyStyle: PartyStyle;
  interests: string[];
  perPersonBudgetFcfa: number;
  nightlyHotelBudgetFcfa: number;
  roomsNeeded: number;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: {
    name: string;
    time: string;
    kind?: TripActivityKind;
    transport?: string;
    meal?: string;
    costFcfa: number;
    notes?: string;
    placeId?: string;
  }[];
  estimatedCostFcfa: number;
}

export interface TripPlan {
  summary: string;
  days: DayPlan[];
  totalEstimatedFcfa: number;
  withinBudget: boolean;
  budgetNote: string;
  placeIds: string[];
  /** Named hotels / restaurants referenced in the plan (for UI / chat). */
  stayIds?: string[];
  eatIds?: string[];
  preferences?: TripPreferences;
  /** Personalized tips for the traveler */
  recommendations?: string[];
}
