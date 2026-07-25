import { ToolDecorator as Tool, Injectable, z, ExecutionContext } from '@nitrostack/core';
import { MapsService } from '../tools/maps/maps.service.js';
import { PlacesService } from '../tools/places/places.service.js';
import { DemographicsService } from '../tools/demographics/demographics.service.js';
import { TrafficService } from '../tools/traffic/traffic.service.js';
import { OpportunityEngineService } from '../opportunity/opportunity-engine.service.js';

const AnalyzeInputSchema = z.object({
  businessType: z.string().describe("Type of business, e.g., 'Coffee Shop'"),
  city: z.string().describe("City to analyze, e.g., 'Coimbatore'"),
  budget: z.number().describe('Investment budget for the business'),
  radius: z.number().describe('Search radius in kilometers'),
});

const AnalyzeOutputSchema = z.object({
  opportunityScore: z.number(),
  recommendedArea: z.string(),
  traffic: z.number(),
  competition: z.number(),
  demographics: z.number(),
  executiveSummary: z.string(),
});

/**
 * Planner
 *
 * Orchestrates the four independent tools (Maps, Places, Demographics,
 * Traffic) and hands their outputs to the Opportunity Engine. Contains no
 * scoring logic and no mock data of its own — both live in their own
 * modules, so this file never needs to change when a tool is swapped for
 * a real API.
 */
@Injectable({
  deps: [
    MapsService,
    PlacesService,
    DemographicsService,
    TrafficService,
    OpportunityEngineService,
  ],
})
export class PlannerTools {
  constructor(
    private readonly mapsService: MapsService,
    private readonly placesService: PlacesService,
    private readonly demographicsService: DemographicsService,
    private readonly trafficService: TrafficService,
    private readonly opportunityEngine: OpportunityEngineService
  ) {}

  @Tool({
    name: 'analyze',
    description:
      'Analyze retail opportunity for a business type, city, budget, and search radius. Returns an opportunity score, recommended area, and executive summary.',
    inputSchema: AnalyzeInputSchema,
    outputSchema: AnalyzeOutputSchema,
  })
  async analyze(input: z.infer<typeof AnalyzeInputSchema>, ctx: ExecutionContext) {
    ctx.logger.info(`Analyzing ${input.businessType} opportunity in ${input.city}`);

    const { zones } = await this.mapsService.findCandidateZones(input);

    const zoneOutputs = await Promise.all(
      zones.map(async (zone) => {
        const [places, demographics, traffic] = await Promise.all([
          this.placesService.getCompetitors(zone, input.businessType),
          this.demographicsService.getDemographics(zone),
          this.trafficService.getTraffic(zone),
        ]);

        return { zone, places, demographics, traffic };
      })
    );

    return this.opportunityEngine.evaluate(input, zoneOutputs);
  }
}
