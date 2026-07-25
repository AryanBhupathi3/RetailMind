import { Module } from '@nitrostack/core';
import { PlannerTools } from './planner.tools';

@Module({
  name: 'planner',
  description: 'RetailMind AI Planner and Orchestration Module',
  controllers: [PlannerTools]
})
export class PlannerModule {}