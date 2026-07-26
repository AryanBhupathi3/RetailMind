"use client";

import { useEffect, useState } from "react";
import { loadStoredAnalysis, type AnalyzeResponse, type ZoneScore } from "../lib/api";
import type { Zone } from "../types/analysis";

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

function toZone(score: ZoneScore, index: number): Zone {
  return {
    // The backend has no zone IDs; the name is unique within one analysis and
    // the index keeps the React key stable even if two names ever collide.
    id: `${index}-${score.name}`,
    name: score.name,
    latitude: score.lat,
    longitude: score.lng,
    opportunityScore: score.opportunityScore,
    demographicScore: score.demographicScore,
    footfallScore: score.footfallPotentialScore,
    competitionScore: score.competitionScore,
    anchorScore: score.anchorScore,
    population: score.population,
    competitorCount: score.competitorCount,
  };
}

function buildSummary(result: AnalyzeResponse): AnalysisSummary {
  // The backend already returns zones best-first, but sorting here keeps the
  // UI correct regardless of the order it receives.
  const ranked = [...result.zones].sort(
    (a, b) => b.opportunityScore - a.opportunityScore
  );

  const zones: ZoneAnalysis[] = ranked.map((score, index) => ({
    zone: toZone(score, index),
    rank: index + 1,
    competitionLevel: getCompetitionLevel(score.competitionScore),
    trafficScore: score.footfallPotentialScore,
    populationEstimate: score.population,
    tier: getOpportunityTier(score.opportunityScore),
  }));

  const topZone = zones[0];

  const recommendationReasons: string[] = [];
  if (topZone.zone.footfallScore >= 70) {
    recommendationReasons.push(
      `Strong footfall potential (${topZone.zone.footfallScore}/100) from the density of transit stops, schools, shops and eateries around the site.`
    );
  }
  if (topZone.zone.demographicScore >= 70) {
    recommendationReasons.push(
      `Favorable demographic profile (${topZone.zone.demographicScore}/100) across population, purchasing power and age mix.`
    );
  }
  if (topZone.zone.anchorScore >= 70) {
    recommendationReasons.push(
      `Nearby anchor points (${topZone.zone.anchorScore}/100) should drive passive discovery.`
    );
  }
  if (topZone.competitionLevel === "Low") {
    recommendationReasons.push(
      `Only ${topZone.zone.competitorCount} direct competitors nearby, leaving room for early market share capture.`
    );
  }
  if (recommendationReasons.length === 0) {
    recommendationReasons.push(
      `Highest combined opportunity score among all ${zones.length} analyzed zones.`
    );
  }

  const risks: string[] = [];
  if (topZone.competitionLevel === "High") {
    risks.push(
      `High competition density (${topZone.zone.competitorCount} nearby competitors) may pressure pricing and customer acquisition.`
    );
  }
  if (topZone.zone.footfallScore < 60) {
    risks.push(
      `Moderate footfall potential (${topZone.zone.footfallScore}/100) may limit walk-in volume.`
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
    `Validate footfall potential with an on-site visit before finalizing lease terms — the score reflects nearby facility density, not observed pedestrian counts.`,
    `Negotiate flexible lease terms given ${topZone.competitionLevel.toLowerCase()} competition in the area.`,
    `Consider a phased or pop-up launch to validate demand ahead of full investment.`,
  ];

  return {
    zones,
    topZone,
    executiveSummary: result.executiveSummary,
    recommendationReasons,
    risks,
    suggestions,
  };
}

/**
 * Reads the analysis produced by the landing-page form. Returns null when the
 * page is opened directly without one — the UI shows a prompt to run an
 * analysis rather than inventing data to fill the screen.
 */
export function useAnalysis(): AnalysisSummary | null {
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);

  // sessionStorage is unavailable during SSR, so the read happens after mount.
  useEffect(() => {
    const stored = loadStoredAnalysis();
    if (stored) setSummary(buildSummary(stored));
  }, []);

  return summary;
}
