"use client";

import { useState } from "react";
import Landing from "./components/Landing";
import Loading from "./components/Loading";

interface BusinessData {
  businessType: string;
  city: string;
  budget: number;
  radius: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = (data: BusinessData) => {
    console.log("Business data:", data);

    setIsLoading(true);

    // Temporary mock delay.
    // Later this will be replaced by the real MCP analysis.
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  if (isLoading) {
    return <Loading />;
  }

  return <Landing onAnalyze={handleAnalyze} />;
}