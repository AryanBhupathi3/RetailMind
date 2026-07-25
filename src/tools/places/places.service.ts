import { Injectable } from '@nitrostack/core';
import type { PlacesResult, ZoneCandidate } from '../../common/types.js';
import { seededScore } from '../../common/mock-utils.js';

/**
 * Places Tool
 *
 * Finds competitors and anchor points near a candidate zone.
 *
 * MOCK IMPLEMENTATION — swap for a real Places API (e.g. Google Places
 * Nearby Search) to go live. The return shape is the only contract other
 * modules rely on, so only this file needs to change.
 */
@Injectable()
export class PlacesService {
  async getCompetitors(
    zone: ZoneCandidate,
    businessType: string
  ): Promise<PlacesResult> {
    const competitorCount = seededScore(`${zone.name}-competitors`, 2, 12);
    const anchorCount = seededScore(`${zone.name}-anchors`, 1, 5);

    return {
      zone: zone.name,
      competitorCount,
      competitors: Array.from(
        { length: Math.min(competitorCount, 3) },
        (_, i) => `${businessType} Competitor ${i + 1}`
      ),
      anchorPoints: Array.from(
        { length: anchorCount },
        (_, i) => `Anchor Point ${i + 1}`
      ),
    };
  }
}
