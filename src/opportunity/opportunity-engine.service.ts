import { Injectable } from '@nitrostack/core';
import type {
  AnalyzeInput,
  AnalyzeOutput,
  DemographicsResult,
  PlacesResult,
  TrafficResult,
  ZoneCandidate,
} from '../common/types.js';

export interface ZoneToolOutputs {
  zone: ZoneCandidate;
  places: PlacesResult;
  demographics: DemographicsResult;
  traffic: TrafficResult;
}

const MAX_TRAFFIC = 50000;
const MAX_POPULATION = 100000;
const MAX_INCOME = 2000;
const MAX_COMPETITORS = 12;
const MAX_ANCHORS = 5;

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Opportunity Engine
 *
 * Combines the four tools' outputs into a single Opportunity Score and
 * recommendation. This is the only place scoring weights live — tool
 * modules stay pure data sources with no knowledge of how their output
 * is used.
 */
@Injectable()
export class OpportunityEngineService {
  evaluate(input: AnalyzeInput, zoneOutputs: ZoneToolOutputs[]): AnalyzeOutput {
    const evaluations = zoneOutputs.map(({ zone, places, demographics, traffic }) => {
      const trafficScore = clampScore((traffic.footTraffic / MAX_TRAFFIC) * 100);
      const populationScore = clampScore((demographics.population / MAX_POPULATION) * 100);
      const incomeScore = clampScore((demographics.medianIncome / MAX_INCOME) * 100);
      const competitionScore = clampScore(
        (1 - places.competitorCount / MAX_COMPETITORS) * 100
      );
      const anchorScore = clampScore((places.anchorPoints.length / MAX_ANCHORS) * 100);
      const demographicScore = clampScore((populationScore + incomeScore) / 2);

      const opportunityScore =
        0.35 * trafficScore +
        0.2 * populationScore +
        0.15 * incomeScore +
        0.15 * competitionScore +
        0.05 * anchorScore;

      return {
        zone: zone.name,
        opportunityScore: Math.round(opportunityScore),
        trafficScore: Math.round(trafficScore),
        competitionScore: Math.round(competitionScore),
        demographicScore: Math.round(demographicScore),
      };
    });

    evaluations.sort((a, b) => b.opportunityScore - a.opportunityScore);
    const top = evaluations[0];

    const executiveSummary =
      `Based on analysis of ${evaluations.length} candidate zones for a ${input.businessType} ` +
      `in ${input.city}, ${top.zone} presents the strongest opportunity with a score of ` +
      `${top.opportunityScore}/100 — driven by a traffic score of ${top.trafficScore}/100 and ` +
      `a demographic score of ${top.demographicScore}/100.`;

    return {
      opportunityScore: top.opportunityScore,
      recommendedArea: top.zone,
      traffic: top.trafficScore,
      competition: top.competitionScore,
      demographics: top.demographicScore,
      executiveSummary,
    };
  }
}
