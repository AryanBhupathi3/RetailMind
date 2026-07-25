import Header from "../components/Header";
import ScoreCard from "../components/ScoreCard";
import OpportunityCard from "../components/OpportunityCard";
import ReportCard from "../components/ReportCard";
import HeatMap from "../components/HeatMap";
import { useAnalysis } from "../hooks/useAnalysis";

export default function RetailAnalysis() {
  const {
    zones,
    topZone,
    executiveSummary,
    recommendationReasons,
    risks,
    suggestions,
  } = useAnalysis();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <Header />

        <section className="py-4">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-600">
            Analysis Results
          </p>

          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Retail Opportunity Report
          </h2>

          <p className="mt-2 text-gray-500">
            Recommended area:{" "}
            <span className="font-semibold text-gray-900">
              {topZone.zone.name}
            </span>{" "}
            — based on {zones.length} analyzed zones (mock data).
          </p>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard
            label="Opportunity Score"
            score={topZone.zone.opportunityScore}
            helperText={topZone.zone.name}
          />
          <ScoreCard
            label="Traffic Score"
            score={topZone.trafficScore}
            helperText="Foot traffic index"
          />
          <ScoreCard
            label="Demographic Score"
            score={topZone.zone.demographicScore}
            helperText="Target audience fit"
          />
          <ScoreCard
            label="Competition"
            score={topZone.zone.competitionScore}
            helperText={`${topZone.competitionLevel} competition`}
          />
        </section>

        <section className="mt-8">
          <HeatMap zones={zones} topZoneId={topZone.zone.id} />
        </section>

        <section className="mt-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            All Analyzed Zones
          </h3>

          <div className="grid gap-5 md:grid-cols-3">
            {zones.map((zoneAnalysis) => (
              <OpportunityCard
                key={zoneAnalysis.zone.id}
                analysis={zoneAnalysis}
                highlighted={zoneAnalysis.zone.id === topZone.zone.id}
              />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <ReportCard
            areaName={topZone.zone.name}
            executiveSummary={executiveSummary}
            reasons={recommendationReasons}
            risks={risks}
            suggestions={suggestions}
          />
        </section>
      </div>
    </main>
  );
}
