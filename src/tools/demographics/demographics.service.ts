import { Injectable } from '@nitrostack/core';
import type { DemographicsResult, ZoneCandidate } from '../../common/types.js';
import { seededScore } from '../../common/mock-utils.js';

/**
 * Demographics Tool
 *
 * Returns population and income indicators for a candidate zone.
 *
 * MOCK IMPLEMENTATION — swap for a real census/demographics API to go live.
 */
@Injectable()
export class DemographicsService {
  async getDemographics(zone: ZoneCandidate): Promise<DemographicsResult> {
    return {
      zone: zone.name,
      population: seededScore(`${zone.name}-population`, 40000, 120000),
      medianIncome: seededScore(`${zone.name}-income`, 400, 2000),
      age18to35Pct: seededScore(`${zone.name}-age`, 35, 75),
    };
  }
}
