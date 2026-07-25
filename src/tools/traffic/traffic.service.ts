import { Injectable } from '@nitrostack/core';
import type { TrafficResult, ZoneCandidate } from '../../common/types.js';
import { seededScore } from '../../common/mock-utils.js';

/**
 * Traffic Tool
 *
 * Estimates foot traffic for a candidate zone.
 *
 * MOCK IMPLEMENTATION — swap for a real traffic/footfall API to go live.
 */
@Injectable()
export class TrafficService {
  async getTraffic(zone: ZoneCandidate): Promise<TrafficResult> {
    return {
      zone: zone.name,
      footTraffic: seededScore(`${zone.name}-traffic`, 8000, 45000),
    };
  }
}
