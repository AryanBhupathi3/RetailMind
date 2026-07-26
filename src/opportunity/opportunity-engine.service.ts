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

const MAX_FOOTFALL_POTENTIAL = 50000;
const MAX_POPULATION = 100000;
const MAX_PURCHASING_POWER = 2000;
const MAX_COMPETITORS = 12;
const MAX_ANCHORS = 5;

/**
 * Age-concentration normalization band.
 *
 * The share of population aged 18-35 does NOT span 0-100% in practice, so
 * using the raw percentage as a 0-100 score would be wrong: it would pin
 * every real city near 30 and throw the signal away.
 *
 * Observed WorldPop values across our test cities:
 *   Coimbatore  28.1%
 *   Hyderabad   33.5%
 *   Bengaluru   36.8%
 *
 * So the real-world band is roughly 28-37%. These anchors bracket it:
 *
 *   AGE_FLOOR   (25%) — at or below India's broad national young-adult
 *                       share; an area with no youth concentration to speak
 *                       of, and therefore no age-driven retail advantage.
 *   AGE_CEILING (40%) — an exceptionally youth-concentrated urban area.
 *
 * The score is then a straight linear rescale between them, clamped to
 * 0-100. Simple, transparent, and auditable — the anchors are OUR OWN
 * judgement, stated here so they can be retuned, not fitted or learned.
 */
const AGE_FLOOR_PCT = 25;
const AGE_CEILING_PCT = 40;

/**
 * Opportunity Score weights. These MUST sum to 1.0, otherwise the score can
 * never reach 100 and the "/100" reported to the user is a lie. The sum is
 * asserted at module load below so the invariant cannot silently regress.
 */
const WEIGHTS = {
  footfallPotential: 0.3,
  population: 0.2,
  purchasingPower: 0.15,
  ageProfile: 0.1,
  competition: 0.2,
  anchors: 0.05,
} as const;

const WEIGHT_SUM = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(WEIGHT_SUM - 1) > 1e-9) {
  throw new Error(
    `Opportunity Score weights must sum to 1.0, but they sum to ${WEIGHT_SUM}.`
  );
}

/**
 * Share of the total score that is demographic in nature. Used to express the
 * user-facing demographic score on a 0-100 scale while keeping the three
 * demographic components in the same proportion they carry in the overall
 * Opportunity Score.
 */
const DEMOGRAPHIC_WEIGHT_SUM =
  WEIGHTS.population + WEIGHTS.purchasingPower + WEIGHTS.ageProfile;

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Opportunity Engine
 *
 * Combines location, competition, demographic, and footfall-potential
 * signals into a single Opportunity Score.
 *
 * What each input actually is:
 * - traffic.footTraffic is a derived Footfall Potential Index, not a
 *   measured pedestrian count.
 * - demographics.medianIncome carries the PURCHASING POWER PROXY, not
 *   measured median household income. The field keeps its original name
 *   only for schema compatibility; nothing here treats it as rupees.
 * - demographics.population and age18to35Pct are real measured WorldPop
 *   values, but are catchment-level, so they are constant across the zones
 *   of a single analysis (see DemographicsService). They therefore shift a
 *   city's scores up or down as a whole rather than separating zones within
 *   it; footfall, competition and purchasing power do the separating.
 *
 * `input.budget` is deliberately NOT used. It is collected and carried
 * through for compatibility, but it does not affect ranking because we have
 * no defensible locality-level rent or location-cost data for Indian
 * neighbourhoods. Inventing a budget-fit term would produce a confident
 * number with nothing real behind it, so the input stays inert until a
 * genuine cost source is available.
 */
@Injectable()
export class OpportunityEngineService {
  evaluate(input: AnalyzeInput, zoneOutputs: ZoneToolOutputs[]): AnalyzeOutput {
    if (zoneOutputs.length === 0) {
      throw new Error(
        `Cannot evaluate opportunity for "${input.city}": no candidate zones ` +
          `were successfully analyzed. Every zone's data lookup failed, so ` +
          `there is nothing to score.`
      );
    }

    const evaluations = zoneOutputs.map(
      ({ zone, places, demographics, traffic }) => {

        // Derived from real accessibility / POI signals.
        const footfallPotentialScore = clampScore(
          (traffic.footTraffic / MAX_FOOTFALL_POTENTIAL) * 100
        );

        const populationScore = clampScore(
          (demographics.population / MAX_POPULATION) * 100
        );

        // medianIncome carries the derived purchasing-power proxy, not income.
        const purchasingPowerScore = clampScore(
          (demographics.medianIncome / MAX_PURCHASING_POWER) * 100
        );

        // Linear rescale of the young-adult share across the documented
        // AGE_FLOOR_PCT..AGE_CEILING_PCT band (see the constants above).
        const ageProfileScore = clampScore(
          ((demographics.age18to35Pct - AGE_FLOOR_PCT) /
            (AGE_CEILING_PCT - AGE_FLOOR_PCT)) *
            100
        );

        // Fewer nearby competitors = higher opportunity.
        const competitionScore = clampScore(
          (1 - places.competitorCount / MAX_COMPETITORS) * 100
        );

        const anchorScore = clampScore(
          (places.anchorPoints.length / MAX_ANCHORS) * 100
        );

        // The demographic figure shown to the user combines exactly the three
        // demographic components the Opportunity Score uses, in exactly the
        // proportion they carry there — so it explains the ranking instead of
        // being an unrelated average.
        const demographicScore = clampScore(
          (WEIGHTS.population * populationScore +
            WEIGHTS.purchasingPower * purchasingPowerScore +
            WEIGHTS.ageProfile * ageProfileScore) /
            DEMOGRAPHIC_WEIGHT_SUM
        );

        const opportunityScore =
          WEIGHTS.footfallPotential * footfallPotentialScore +
          WEIGHTS.population * populationScore +
          WEIGHTS.purchasingPower * purchasingPowerScore +
          WEIGHTS.ageProfile * ageProfileScore +
          WEIGHTS.competition * competitionScore +
          WEIGHTS.anchors * anchorScore;

        return {
          zone: zone.name,
          lat: zone.lat,
          lng: zone.lng,
          opportunityScore: Math.round(opportunityScore),
          footfallPotentialScore: Math.round(footfallPotentialScore),
          competitionScore: Math.round(competitionScore),
          demographicScore: Math.round(demographicScore),
          populationScore: Math.round(populationScore),
          purchasingPowerScore: Math.round(purchasingPowerScore),
          ageProfileScore: Math.round(ageProfileScore),
          anchorScore: Math.round(anchorScore),
          population: demographics.population,
          competitorCount: places.competitorCount,
        };
      }
    );

    evaluations.sort(
      (a, b) => b.opportunityScore - a.opportunityScore
    );

    const top = evaluations[0];

    console.error(
      `[opportunity] winner="${top.zone}" footfallPotential=${top.footfallPotentialScore} ` +
        `population=${top.populationScore} purchasingPower=${top.purchasingPowerScore} ` +
        `ageProfile=${top.ageProfileScore} competition=${top.competitionScore} ` +
        `anchors=${top.anchorScore} => opportunity=${top.opportunityScore}`
    );

    const executiveSummary =
      `Based on analysis of ${evaluations.length} candidate zones for a ${input.businessType} ` +
      `in ${input.city}, ${top.zone} presents the strongest opportunity with a score of ` +
      `${top.opportunityScore}/100 — driven by a footfall potential score of ` +
      `${top.footfallPotentialScore}/100 and a demographic score of ` +
      `${top.demographicScore}/100.`;

    return {
      opportunityScore: top.opportunityScore,
      recommendedArea: top.zone,

      // AnalyzeOutput calls this field "traffic" and the name is kept for
      // schema compatibility, but the value is the Footfall Potential Score —
      // not measured vehicle or pedestrian traffic.
      traffic: top.footfallPotentialScore,

      competition: top.competitionScore,
      demographics: top.demographicScore,
      executiveSummary,

      // Every evaluated zone, best first. These are the same numbers that
      // produced the ranking above — no separate derivation.
      zones: evaluations.map((e) => ({
        name: e.zone,
        lat: e.lat,
        lng: e.lng,
        opportunityScore: e.opportunityScore,
        footfallPotentialScore: e.footfallPotentialScore,
        demographicScore: e.demographicScore,
        competitionScore: e.competitionScore,
        anchorScore: e.anchorScore,
        population: e.population,
        competitorCount: e.competitorCount,
      })),
    };
  }
}