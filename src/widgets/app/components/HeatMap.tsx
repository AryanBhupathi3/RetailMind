import type { ZoneAnalysis } from "../hooks/useAnalysis";

interface HeatMapProps {
  zones: ZoneAnalysis[];
  topZoneId: string;
}

const tierStyles = {
  high: { dot: "bg-green-500", ring: "ring-green-300" },
  medium: { dot: "bg-amber-500", ring: "ring-amber-300" },
  low: { dot: "bg-red-500", ring: "ring-red-300" },
};

export default function HeatMap({ zones, topZoneId }: HeatMapProps) {
  const lats = zones.map((z) => z.zone.latitude);
  const lngs = zones.map((z) => z.zone.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  const positionFor = (lat: number, lng: number) => ({
    left: `${10 + ((lng - minLng) / lngRange) * 80}%`,
    top: `${10 + ((maxLat - lat) / latRange) * 80}%`,
  });

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Opportunity Heatmap
        </h3>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Low
          </span>
        </div>
      </div>

      <div className="relative h-72 w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 ring-1 ring-gray-100 sm:h-80">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {zones.map((z) => {
          const pos = positionFor(z.zone.latitude, z.zone.longitude);
          const style = tierStyles[z.tier];
          const isTop = z.zone.id === topZoneId;

          return (
            <div
              key={z.zone.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={pos}
            >
              <div className="relative flex flex-col items-center">
                {isTop && (
                  <span
                    className={`absolute -inset-3 animate-ping rounded-full ${style.dot} opacity-30`}
                  />
                )}
                <div
                  className={`relative rounded-full ${style.dot} ring-4 ${style.ring} ${
                    isTop ? "h-5 w-5 ring-8" : "h-3.5 w-3.5"
                  }`}
                />
                <span className="mt-1.5 whitespace-nowrap rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium text-gray-700 shadow-sm">
                  {z.zone.name}
                  {isTop ? " ★" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-gray-400">
        Illustrative placeholder — plots relative zone positions from mock
        coordinates. No live map data.
      </p>
    </div>
  );
}
