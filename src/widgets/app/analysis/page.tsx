import Header from "../components/Header";
import { mockZones } from "../data/mockData";

export default function AnalysisPage() {
  const rankedZones = [...mockZones].sort(
    (a, b) => b.opportunityScore - a.opportunityScore
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6">
        <Header />

        <section className="py-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-600">
            Analysis Results
          </p>

          <h2 className="text-3xl font-bold text-gray-900">
            Top Opportunity Zones
          </h2>

          <p className="mt-2 text-gray-500">
            Ranked by overall opportunity score (mock data).
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {rankedZones.map((zone, index) => (
              <div
                key={zone.id}
                className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Rank #{index + 1}
                  </span>

                  <span className="text-2xl font-bold text-green-600">
                    {zone.opportunityScore}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900">
                  {zone.name}
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
                </p>

                <dl className="mt-5 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Demographics</dt>
                    <dd className="font-medium text-gray-900">
                      {zone.demographicScore}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Footfall</dt>
                    <dd className="font-medium text-gray-900">
                      {zone.footfallScore}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Competition</dt>
                    <dd className="font-medium text-gray-900">
                      {zone.competitionScore}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Accessibility</dt>
                    <dd className="font-medium text-gray-900">
                      {zone.accessibilityScore}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Anchor Points</dt>
                    <dd className="font-medium text-gray-900">
                      {zone.anchorScore}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
