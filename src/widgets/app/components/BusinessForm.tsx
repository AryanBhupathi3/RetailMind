"use client";

import { useState } from "react";

interface BusinessFormProps {
  onAnalyze: (data: {
    businessType: string;
    city: string;
    budget: number;
    radius: number;
  }) => void;
}

export default function BusinessForm({ onAnalyze }: BusinessFormProps) {
  const [businessType, setBusinessType] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [radius, setRadius] = useState("5");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onAnalyze({
      businessType,
      city,
      budget: Number(budget),
      radius: Number(radius),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Business Type */}
      <div>
        <label className="mb-2 block font-medium">
          Business Type
        </label>

        <input
          type="text"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          placeholder="e.g. Coffee Shop"
          required
          className="w-full rounded-xl border p-3"
        />
      </div>

      {/* City */}
      <div>
        <label className="mb-2 block font-medium">
          City / Location
        </label>

        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Coimbatore"
          required
          className="w-full rounded-xl border p-3"
        />
      </div>

      {/* Budget */}
      <div>
        <label className="mb-2 block font-medium">
          Budget
        </label>

        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Enter investment budget"
          min="0"
          required
          className="w-full rounded-xl border p-3"
        />
      </div>

      {/* Radius */}
      <div>
        <label className="mb-2 block font-medium">
          Search Radius (km)
        </label>

        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          min="1"
          max="50"
          required
          className="w-full rounded-xl border p-3"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
      >
        Analyze Location
      </button>
    </form>
  );
}