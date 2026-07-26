"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
// Vendored Leaflet CSS. The upstream stylesheet cannot be imported directly
// because the widget bundler has no PNG loader — see the file's header.
import "./leaflet-core.css";
import type { ZoneAnalysis } from "../hooks/useAnalysis";

interface OpportunityMapViewProps {
  zones: ZoneAnalysis[];
  topZoneId: string;
}

/**
 * Marker colours by opportunity tier. Deliberately the same green/amber/red
 * the rest of the report uses, so a zone reads the same on the map as it does
 * on its card.
 */
const tierColors: Record<ZoneAnalysis["tier"], string> = {
  high: "#22c55e",
  medium: "#f59e0b",
  low: "#ef4444",
};

/**
 * Frames the map on the zones actually returned by the analysis, so it works
 * for any city without a hardcoded centre or zoom.
 */
function FitToZones({ zones }: { zones: ZoneAnalysis[] }) {
  const map = useMap();

  useEffect(() => {
    if (zones.length === 0) return;

    const points: LatLngTuple[] = zones.map((z) => [
      z.zone.latitude,
      z.zone.longitude,
    ]);

    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }

    // Padding keeps markers off the edges; maxZoom stops a tight cluster of
    // zones from zooming in so far that the surrounding city is lost.
    map.fitBounds(points as LatLngBoundsExpression, {
      padding: [40, 40],
      maxZoom: 15,
    });
  }, [map, zones]);

  return null;
}

export default function OpportunityMapView({
  zones,
  topZoneId,
}: OpportunityMapViewProps) {
  if (zones.length === 0) return null;

  return (
    <MapContainer
      // A center/zoom is required by the component, but FitToZones immediately
      // overrides it from the real coordinates.
      center={[zones[0].zone.latitude, zones[0].zone.longitude]}
      zoom={12}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ background: "#f8fafc" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitToZones zones={zones} />

      {zones.map((z) => {
        const isTop = z.zone.id === topZoneId;
        const color = tierColors[z.tier];

        return (
          <CircleMarker
            key={z.zone.id}
            center={[z.zone.latitude, z.zone.longitude]}
            // The recommended zone is deliberately larger and more opaque so
            // it reads as the answer at a glance.
            radius={isTop ? 14 : 8}
            pathOptions={{
              color: isTop ? "#15803d" : color,
              weight: isTop ? 3 : 2,
              fillColor: color,
              fillOpacity: isTop ? 0.85 : 0.6,
            }}
          >
            {isTop && (
              <Tooltip permanent direction="top" offset={[0, -14]}>
                <span className="text-[11px] font-semibold">Recommended</span>
              </Tooltip>
            )}

            <Popup>
              <div className="min-w-[190px]">
                <p className="text-sm font-semibold text-gray-900">
                  {z.zone.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Rank #{z.rank}
                  {isTop ? " · Recommended" : ""}
                </p>

                <dl className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Opportunity</dt>
                    <dd className="font-semibold text-gray-900">
                      {z.zone.opportunityScore}/100
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Footfall potential</dt>
                    <dd className="font-medium text-gray-900">
                      {z.zone.footfallScore}/100
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Demographics</dt>
                    <dd className="font-medium text-gray-900">
                      {z.zone.demographicScore}/100
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Competition</dt>
                    <dd className="font-medium text-gray-900">
                      {z.zone.competitionScore}/100
                    </dd>
                  </div>
                  {/* Cost pressure only exists on results from the current
                      output shape, so it is rendered conditionally. */}
                  {typeof z.zone.costPressureIndex === "number" && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Cost pressure</dt>
                      <dd className="font-medium text-gray-900">
                        {z.zone.costPressureIndex}/100
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
