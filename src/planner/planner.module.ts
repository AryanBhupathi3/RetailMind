import { Module } from '@nitrostack/core';
import { PlannerTools } from './planner.tools.js';

@Module({
  name: 'planner',
  description: 'RetailMind AI Planner and Orchestration Module',
  controllers: [PlannerTools]
})
export class PlannerModule {}