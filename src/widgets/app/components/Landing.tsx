"use client";

import Header from "./Header";
import BusinessForm from "./BusinessForm";

interface LandingProps {
  onAnalyze: (data: {
    businessType: string;
    city: string;
    budget: number;
    radius: number;
  }) => void;
}

export default function Landing({ onAnalyze }: LandingProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6">
        <Header />

        <section className="grid items-center gap-12 py-16 md:grid-cols-2">
          
          {/* Left Section */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-green-600">
              Retail Location Intelligence
            </p>

            <h2 className="text-4xl font-bold leading-tight md:text-5xl">
              Find the right place for your next business.
            </h2>

            <p className="mt-6 max-w-xl text-lg text-gray-600">
              RetailMind analyzes location, competition, demographics,
              and traffic to identify promising retail opportunities.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-white px-4 py-2 text-sm shadow-sm">
                Location Analysis
              </span>

              <span className="rounded-full bg-white px-4 py-2 text-sm shadow-sm">
                Competitor Insights
              </span>

              <span className="rounded-full bg-white px-4 py-2 text-sm shadow-sm">
                Traffic Intelligence
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="rounded-2xl bg-white p-7 shadow-lg">
            <div className="mb-6">
              <h3 className="text-xl font-semibold">
                Analyze a Location
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Tell RetailMind what kind of business you're planning.
              </p>
            </div>

            <BusinessForm onAnalyze={onAnalyze} />
          </div>

        </section>
      </div>
    </main>
  );
}