import { Module } from '@nitrostack/core';
import { OpportunityEngineService } from './opportunity-engine.service.js';

@Module({
  name: 'opportunity',
  description: 'Opportunity Engine - combines tool outputs into a final score and recommendation',
  providers: [OpportunityEngineService],
  exports: [OpportunityEngineService],
})
export class OpportunityModule {}
