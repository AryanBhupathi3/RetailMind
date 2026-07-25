import { mockAgents, mockZones } from "../data/mockData";
import type { AgentState, Zone } from "../types/analysis";

export type CompetitionLevel = "Low" | "Medium" | "High";
export type OpportunityTier = "high" | "medium" | "low";

export interface ZoneAnalysis {
  zone: Zone;
  rank: number;
  competitionLevel: CompetitionLevel;
  trafficScore: number;
  populationEstimate: number;
  tier: OpportunityTier;
}

export interface AnalysisSummary {
  zones: ZoneAnalysis[];
  topZone: ZoneAnalysis;
  agents: AgentState[];
  executiveSummary: string;
  recommendationReasons: string[];
  risks: string[];
  suggestions: string[];
}

function getCompetitionLevel(competitionScore: number): CompetitionLevel {
  if (competitionScore >= 70) return "Low";
  if (competitionScore >= 45) return "Medium";
  return "High";
}

function getOpportunityTier(opportunityScore: number): OpportunityTier {
  if (opportunityScore >= 80) return "high";
  if (opportunityScore >= 60) return "medium";
  return "low";
}

export function useAnalysis(): AnalysisSummary {
  const ranked = [...mockZones].sort(
    (a, b) => b.opportunityScore - a.opportunityScore
  );

  const zones: ZoneAnalysis[] = ranked.map((zone, index) => ({
    zone,
    rank: index + 1,
    competitionLevel: getCompetitionLevel(zone.competitionScore),
    trafficScore: zone.footfallScore,
    populationEstimate: Math.round(zone.demographicScore * 1240),
    tier: getOpportunityTier(zone.opportunityScore),
  }));

  const topZone = zones[0];

  const executiveSummary = `Based on analysis of ${zones.length} candidate zones, ${topZone.zone.name} presents the strongest opportunity with a score of ${topZone.zone.opportunityScore}/100 — driven by footfall of ${topZone.zone.footfallScore}/100 and a demographic fit of ${topZone.zone.demographicScore}/100.`;

  const recommendationReasons: string[] = [];
  if (topZone.zone.footfallScore >= 80) {
    recommendationReasons.push(
      `High foot traffic (${topZone.zone.footfallScore}/100) indicates strong pedestrian demand near the site.`
    );
  }
  if (topZone.zone.demographicScore >= 80) {
    recommendationReasons.push(
      `Favorable demographic profile (${topZone.zone.demographicScore}/100) aligns with the target customer base.`
    );
  }
  if (topZone.zone.accessibilityScore >= 80) {
    recommendationReasons.push(
      `Strong accessibility (${topZone.zone.accessibilityScore}/100) via nearby transit and road connectivity.`
    );
  }
  if (topZone.competitionLevel === "Low") {
    recommendationReasons.push(
      `Low competition density leaves room for early market share capture.`
    );
  }
  if (recommendationReasons.length === 0) {
    recommendationReasons.push(
      `Highest combined opportunity score among all analyzed zones.`
    );
  }

  const risks: string[] = [];
  if (topZone.competitionLevel === "High") {
    risks.push(
      `High competition density may pressure pricing and customer acquisition.`
    );
  }
  if (topZone.zone.accessibilityScore < 75) {
    risks.push(
      `Moderate accessibility (${topZone.zone.accessibilityScore}/100) could limit reach for customers outside walking distance.`
    );
  }
  if (topZone.zone.anchorScore < 75) {
    risks.push(
      `Fewer nearby anchor points (${topZone.zone.anchorScore}/100) may reduce passive discovery.`
    );
  }
  if (risks.length === 0) {
    risks.push(`No major risk factors identified in the current data set.`);
  }

  const suggestions = [
    `Validate footfall estimates with an on-site visit before finalizing lease terms.`,
    `Negotiate flexible lease terms given ${topZone.competitionLevel.toLowerCase()} competition in the area.`,
    `Consider a phased or pop-up launch to validate demand ahead of full investment.`,
  ];

  return {
    zones,
    topZone,
    agents: mockAgents,
    executiveSummary,
    recommendationReasons,
    risks,
    suggestions,
  };
}
