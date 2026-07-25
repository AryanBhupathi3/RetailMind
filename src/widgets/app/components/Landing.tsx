"use client";

import { useState } from "react";
import { BusinessInput } from "../types/retailmind";

interface LandingProps {
  onAnalyze: (input: BusinessInput) => void;
}

export default function Landing({ onAnalyze }: LandingProps) {
  const [businessType, setBusinessType] = useState("");
  const [budget, setBudget] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const input: BusinessInput = {
      businessType,
      budget: Number(budget),
      city,
      radiusKm: 5,
    };

    onAnalyze(input);
  };

  return (
    <main>
      <h1>RetailMind</h1>

      <p>Find the best location for your next business.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Business Type</label>

          <input
            type="text"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="Specialty Coffee Shop"
            required
          />
        </div>

        <div>
          <label>Budget</label>

          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="2500000"
            required
          />
        </div>

        <div>
          <label>City</label>

          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Coimbatore"
            required
          />
        </div>

        <button type="submit">
          Analyze Opportunity
        </button>
      </form>
    </main>
  );
}