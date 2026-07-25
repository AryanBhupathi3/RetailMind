import { z } from "zod";
import { defineTool } from "@nitrostack/core";

// 1. Data Contracts (Schemas)
export const AnalyzeAreaInputSchema = z.object({
  city: z.string().describe("The city to analyze, e.g., 'Hyderabad'"),
  business: z.string().describe("The type of business, e.g., 'Coffee Shop'")
});

export const FindCompetitorsInputSchema = z.object({
  area: z.string().describe("The specific zone name, e.g., 'Gachibowli'"),
  business: z.string().describe("The type of business, e.g., 'Coffee Shop'")
});

export const DemographicsInputSchema = z.object({
  area: z.string().describe("The specific zone name, e.g., 'Gachibowli'")
});

export const TrafficInputSchema = z.object({
  area: z.string().describe("The specific zone name, e.g., 'Gachibowli'")
});

// 2. Individual Functional Tools
export const analyzeAreaTool = defineTool({
  name: "analyze_area",
  title: "Analyze Area",
  description: "Identify candidate zones in a city",
  inputSchema: AnalyzeAreaInputSchema,
  async handler(input, ctx) {
    ctx.logger.info(`Finding zones in ${input.city} for ${input.business}`);
    return {
      areas: [
        { name: "Gachibowli", lat: 17.443, lng: 78.377 },
        { name: "Madhapur", lat: 17.451, lng: 78.390 }
      ]
    };
  }
});

export const findCompetitorsTool = defineTool({
  name: "find_competitors",
  title: "Find Competitors",
  description: "Count nearby competitor businesses and find anchor points",
  inputSchema: FindCompetitorsInputSchema,
  async handler(input, ctx) {
    if (input.area === "Gachibowli") {
      return {
        location: "Gachibowli",
        competitor_count: 8,
        competitors: ["Starbucks", "Cafe Coffee Day"],
        anchor_points: ["Mindspace IT Park", "Raidurg Metro"]
      };
    }
    return {
      location: input.area,
      competitor_count: 4,
      competitors: ["Local Cafe"],
      anchor_points: ["Metro Station"]
    };
  }
});

export const demographicsTool = defineTool({
  name: "demographics",
  title: "Get Demographics",
  description: "Fetch population and income data for a zone",
  inputSchema: DemographicsInputSchema,
  async handler(input, ctx) {
    return {
      area: input.area,
      population: 92000,
      median_income: 1200,
      age_18_35_pct: 65
    };
  }
});

export const trafficTool = defineTool({
  name: "traffic",
  title: "Get Traffic",
  description: "Fetch foot traffic estimates for a zone",
  inputSchema: TrafficInputSchema,
  async handler(input, ctx) {
    return {
      area: input.area,
      foot_traffic: 35000
    };
  }
});

// 3. Main Orchestration Tool (Opportunity Scoring Model)
export const runRetailPlannerTool = defineTool({
  name: "run_retail_planner",
  title: "RetailMind Planner Agent",
  description: "Orchestrates tools and computes the Opportunity Score for retail locations",
  inputSchema: AnalyzeAreaInputSchema,
  async handler(input, ctx) {
    ctx.logger.info(`Starting RetailMind AI analysis for ${input.business} in ${input.city}`);

    const areasResult = await analyzeAreaTool.handler(input, ctx);
    const evaluatedZones = [];

    const maxTraffic = 50000;
    const maxPop = 100000;
    const maxIncome = 2000;
    const maxComp = 12;
    const maxAnchors = 5;

    for (const zone of areasResult.areas) {
      const compData = await findCompetitorsTool.handler({ area: zone.name, business: input.business }, ctx);
      const demoData = await demographicsTool.handler({ area: zone.name }, ctx);
      const trafData = await trafficTool.handler({ area: zone.name }, ctx);

      const trafficScore = (trafData.foot_traffic / maxTraffic) * 100;
      const popScore = (demoData.population / maxPop) * 100;
      const incomeScore = (demoData.median_income / maxIncome) * 100;
      const compScore = (1 - (compData.competitor_count / maxComp)) * 100;
      const anchorScore = (compData.anchor_points.length / maxAnchors) * 100;

      // Opportunity Score formula
      const opportunityScore = 
        (0.35 * trafficScore) + 
        (0.20 * popScore) + 
        (0.15 * incomeScore) + 
        (0.15 * compScore) + 
        (0.05 * anchorScore);

      let recommendation = "Not Recommended";
      if (opportunityScore > 85) {
        recommendation = "Highly Recommended";
      } else if (opportunityScore >= 70) {
        recommendation = "Recommended";
      }

      evaluatedZones.push({
        area: zone.name,
        coordinates: { lat: zone.lat, lng: zone.lng },
        score: Math.round(opportunityScore * 10) / 10,
        recommendation,
        metrics: {
          foot_traffic: trafData.foot_traffic,
          population: demoData.population,
          competitors: compData.competitor_count,
          anchors: compData.anchor_points
        }
      });
    }

    evaluatedZones.sort((a, b) => b.score - a.score);

    return {
      city: input.city,
      business: input.business,
      top_recommendation: evaluatedZones[0],
      all_zones_ranked: evaluatedZones
    };
  }
});