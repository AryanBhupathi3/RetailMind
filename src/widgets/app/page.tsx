"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Landing from "./components/Landing";
import Loading from "./components/Loading";
import type { BusinessFormData } from "./components/BusinessForm";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = (data: BusinessFormData) => {
    console.log("Business data:", data);

    setIsLoading(true);

    // Temporary mock delay.
    // Later this will be replaced by the real MCP analysis.
    setTimeout(() => {
      router.push("/analysis");
    }, 3000);
  };

  if (isLoading) {
    return <Loading />;
  }

  return <Landing onAnalyze={handleAnalyze} />;
}