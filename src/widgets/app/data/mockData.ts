import { Zone, AgentState } from "../types/analysis";

export const mockZones: Zone[] = [
  {
    id: "zone-a",
    name: "RS Puram",
    latitude: 11.0168,
    longitude: 76.9558,
    opportunityScore: 91,
    demographicScore: 88,
    footfallScore: 93,
    competitionScore: 61,
    accessibilityScore: 87,
    anchorScore: 90,
  },
  {
    id: "zone-b",
    name: "Gandhipuram",
    latitude: 11.0183,
    longitude: 76.9725,
    opportunityScore: 76,
    demographicScore: 75,
    footfallScore: 89,
    competitionScore: 78,
    accessibilityScore: 91,
    anchorScore: 82,
  },
  {
    id: "zone-c",
    name: "Saibaba Colony",
    latitude: 11.0267,
    longitude: 76.9438,
    opportunityScore: 58,
    demographicScore: 67,
    footfallScore: 61,
    competitionScore: 73,
    accessibilityScore: 72,
    anchorScore: 65,
  },
];

export const mockAgents: AgentState[] = [
  { name: "Maps Agent", status: "waiting" },
  { name: "Places Agent", status: "waiting" },
  { name: "Demographics Agent", status: "waiting" },
  { name: "Traffic Agent", status: "waiting" },
];