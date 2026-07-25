import { Injectable } from '@nitrostack/core';
import type { AnalyzeInput, MapsResult, ZoneCandidate } from '../../common/types.js';
import { haversineDistanceKm } from '../../common/geo-utils.js';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
// The public overpass-api.de instance is frequently overloaded (504s/timeouts
// under load). These are all real, free, keyless Overpass mirrors — tried in
// order until one responds. This is resilience across real data sources, not
// a fallback to mock data.
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];
// Nominatim's usage policy requires a descriptive, non-generic User-Agent
// identifying the application; requests without one may be blocked.
const USER_AGENT = 'RetailMind-Hackathon/1.0 (contact: retailmind-project)';
const NOMINATIM_TIMEOUT_MS = 10_000;
// Mirrors are raced in parallel (Promise.any), so this bounds the worst case
// on its own — it is NOT summed across mirrors. Kept close to the Overpass
// query's own embedded [timeout:10] so a slow server-side query and a
// client-side abort land around the same time instead of us waiting on a
// server that's already given up (or vice versa).
const OVERPASS_TIMEOUT_MS = 12_000;
const MAX_CANDIDATE_ZONES = 8;
const PLACE_TAGS = ['suburb', 'neighbourhood', 'quarter', 'hamlet', 'locality'];

interface NominatimResult {
  lat: string;
  lon: string;
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: { name?: string };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

/**
 * Maps Tool
 *
 * Finds real candidate localities/neighborhoods within `input.radius`
 * kilometers of `input.city`, using OpenStreetMap's free, keyless APIs:
 * Nominatim to geocode the city, Overpass to find named localities around
 * it. No mock data — on any failure this throws rather than silently
 * falling back to fake zones, so problems are visible during development.
 */
@Injectable()
export class MapsService {
  async findCandidateZones(input: AnalyzeInput): Promise<MapsResult> {
    const cityCenter = await this.geocodeCity(input.city);
    const zones = await this.findLocalitiesNear(cityCenter, input.radius, input.city);

    return { zones };
  }

  private async geocodeCity(city: string): Promise<{ lat: number; lng: number }> {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set('q', city);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');

    const results = await this.fetchJson<NominatimResult[]>(
      url.toString(),
      'Nominatim geocoding',
      undefined,
      NOMINATIM_TIMEOUT_MS
    );

    if (!Array.isArray(results) || results.length === 0) {
      throw new Error(
        `Could not find city "${city}". Check the spelling or try a more specific name (e.g. include the state/country).`
      );
    }

    const lat = Number(results[0].lat);
    const lng = Number(results[0].lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error(`Nominatim returned malformed coordinates for city "${city}".`);
    }

    return { lat, lng };
  }

  private async findLocalitiesNear(
    center: { lat: number; lng: number },
    radiusKm: number,
    city: string
  ): Promise<ZoneCandidate[]> {
    const radiusMeters = Math.round(radiusKm * 1000);
    const placeFilter = PLACE_TAGS.join('|');
    const around = `around:${radiusMeters},${center.lat},${center.lng}`;

    const query = `
      [out:json][timeout:10];
      (
        node["place"~"^(${placeFilter})$"](${around});
        way["place"~"^(${placeFilter})$"](${around});
        relation["place"~"^(${placeFilter})$"](${around});
      );
      out center;
    `;

    const overpass = await this.queryOverpassWithFallback(query);

    if (!overpass || !Array.isArray(overpass.elements)) {
      throw new Error('Received malformed response from Overpass API.');
    }

    const seenNames = new Set<string>();
    const candidates: (ZoneCandidate & { distanceKm: number })[] = [];

    for (const el of overpass.elements) {
      const name = el.tags?.name?.trim();
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;

      if (!name || lat === undefined || lng === undefined) continue;
      if (seenNames.has(name)) continue;

      const distanceKm = haversineDistanceKm(center.lat, center.lng, lat, lng);
      if (distanceKm > radiusKm) continue;

      seenNames.add(name);
      candidates.push({ name, lat, lng, distanceKm });
    }

    if (candidates.length === 0) {
      throw new Error(
        `No candidate localities found within ${radiusKm}km of "${city}". Try increasing the radius.`
      );
    }

    return candidates
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, MAX_CANDIDATE_ZONES)
      .map(({ name, lat, lng }) => ({ name, lat, lng }));
  }

  /**
   * Races all real Overpass mirrors in parallel, returning whichever
   * responds first successfully. Only throws once every mirror has failed —
   * still 100% real data sources, just resilient against any single mirror
   * being overloaded, and without multiplying worst-case latency by trying
   * mirrors one after another.
   */
  private async queryOverpassWithFallback(query: string): Promise<OverpassResponse> {
    const attempts = OVERPASS_URLS.map((url) =>
      this.fetchJson<OverpassResponse>(
        url,
        'Overpass locality search',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
        },
        OVERPASS_TIMEOUT_MS
      ).catch((err) => {
        throw new Error(`${url}: ${err instanceof Error ? err.message : String(err)}`);
      })
    );

    try {
      return await Promise.any(attempts);
    } catch (err) {
      if (err instanceof AggregateError) {
        const messages = err.errors.map((e) => (e instanceof Error ? e.message : String(e)));
        throw new Error(`All Overpass mirrors failed:\n${messages.join('\n')}`);
      }
      throw err;
    }
  }

  private async fetchJson<T>(
    url: string,
    context: string,
    init: RequestInit | undefined,
    timeoutMs: number
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers: {
          'User-Agent': USER_AGENT,
          ...(init?.headers ?? {}),
        },
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`${context} request timed out after ${timeoutMs}ms.`);
      }
      throw new Error(
        `${context} request failed: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 429) {
      throw new Error(`${context} rate limit exceeded (HTTP 429). Please wait and try again.`);
    }

    if (!response.ok) {
      throw new Error(`${context} failed with HTTP ${response.status} ${response.statusText}.`);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new Error(`${context} returned a response that could not be parsed as JSON.`);
    }
  }
}
