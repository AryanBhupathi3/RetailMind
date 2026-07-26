import { getCostLevel, type ZoneAnalysis } from "../hooks/useAnalysis";

interface OpportunityCardProps {
  analysis: ZoneAnalysis;
  highlighted?: boolean;
}

export default function OpportunityCard({
  analysis,
  highlighted,
}: OpportunityCardProps) {
  const { zone, rank, competitionLevel, trafficScore, populationEstimate } =
    analysis;

  return (
    <div
      className={`rounded-2xl p-6 shadow-lg ring-1 ${
        highlighted
          ? "bg-green-600 text-white ring-green-600"
          : "bg-white text-gray-900 ring-gray-100"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            highlighted
              ? "bg-white/20 text-white"
              : "bg-green-100 text-green-700"
          }`}
        >
          {highlighted ? "Recommended" : `Rank #${rank}`}
        </span>

        <span className="text-2xl font-bold">{zone.opportunityScore}</span>
      </div>

      <h3 className="text-lg font-semibold">{zone.name}</h3>

      <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className={highlighted ? "text-white/70" : "text-gray-500"}>
            Competition
          </dt>
          <dd className="mt-0.5 font-medium">{competitionLevel}</dd>
        </div>

        <div>
          <dt className={highlighted ? "text-white/70" : "text-gray-500"}>
            Footfall
          </dt>
          <dd className="mt-0.5 font-medium">{trafficScore}/100</dd>
        </div>

        <div>
          <dt className={highlighted ? "text-white/70" : "text-gray-500"}>
            Population
          </dt>
          <dd className="mt-0.5 font-medium">
            {populationEstimate.toLocaleString()}
          </dd>
        </div>
      </dl>

      <div
        className={`mt-4 flex items-center justify-between border-t pt-3 text-sm ${
          highlighted ? "border-white/20" : "border-gray-100"
        }`}
      >
        <span className={highlighted ? "text-white/70" : "text-gray-500"}>
          Cost pressure
        </span>
        <span className="font-medium">
          {getCostLevel(zone.costPressureIndex)} ({zone.costPressureIndex}/100)
        </span>
      </div>
    </div>
  );
}
