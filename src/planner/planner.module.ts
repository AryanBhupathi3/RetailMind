import { Module } from '@nitrostack/core';
import { 
  analyzeAreaTool, 
  findCompetitorsTool, 
  demographicsTool, 
  trafficTool, 
  runRetailPlannerTool 
} from './planner.tools';

@Module({
  name: 'planner',
  description: 'RetailMind AI Planner and Orchestration Module',
  controllers: [
    analyzeAreaTool, 
    findCompetitorsTool, 
    demographicsTool, 
    trafficTool, 
    runRetailPlannerTool
  ]
})
export class PlannerModule {}