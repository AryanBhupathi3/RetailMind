export interface AnalyzeInput {
  businessType: string;
  city: string;
  budget: number;
  radius: number;
}

export interface ZoneCandidate {
  name: string;
  lat: number;
  lng: number;
}

export interface MapsResult {
  zones: ZoneCandidate[];
}

export interface PlacesResult {
  zone: string;
  competitorCount: number;
  competitors: string[];
  anchorPoints: string[];
}

export interface DemographicsResult {
  zone: string;
  population: number;
  medianIncome: number;
  age18to35Pct: number;
}

export interface TrafficResult {
  zone: string;
  footTraffic: number;
}

/**
 * Per-zone scores for every candidate the analysis evaluated, not just the
 * winner. The Opportunity Engine already computes these internally; exposing
 * them lets a client rank, map and compare zones without re-deriving anything
 * (and without inventing data to fill a UI).
 */
export interface ZoneScore {
  name: string;
  lat: number;
  lng: number;
  opportunityScore: number;
  footfallPotentialScore: number;
  demographicScore: number;
  competitionScore: number;
  anchorScore: number;
  /** Real WorldPop catchment population — see DemographicsService. */
  population: number;
  competitorCount: number;
}

export interface AnalyzeOutput {
  opportunityScore: number;
  recommendedArea: string;
  traffic: number;
  competition: number;
  demographics: number;
  executiveSummary: string;
  /** Every evaluated zone, best first. Additive — the fields above are unchanged. */
  zones: ZoneScore[];
}
