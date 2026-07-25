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

export interface AnalyzeOutput {
  opportunityScore: number;
  recommendedArea: string;
  traffic: number;
  competition: number;
  demographics: number;
  executiveSummary: string;
}
