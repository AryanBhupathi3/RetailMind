export interface BusinessInput {
  businessType: string;
  budget: number;
  city: string;
  radiusKm: number;
}

export type AgentStatus =
  | "waiting"
  | "running"
  | "completed"
  | "failed";

export interface AgentState {
  name: string;
  status: AgentStatus;
}

export interface Zone {
  id: string;
  name: string;

  latitude: number;
  longitude: number;

  opportunityScore: number;

  demographicScore: number;
  footfallScore: number;
  competitionScore: number;
  accessibilityScore: number;
  anchorScore: number;
}