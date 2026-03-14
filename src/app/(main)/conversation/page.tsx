"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScenarioCard } from "@/components/conversation/ScenarioCard";
import { SCENARIOS } from "@/mastra/scenarios";

export default function ConversationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSelect(scenarioId: number) {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scenarioId }),
      });

      if (!res.ok) throw new Error("Failed to create conversation");

      const conversation = await res.json();
      router.push(`/conversation/${conversation.id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-1">Choisir un scénario</h2>
      <p className="text-sm text-gray-500 mb-4">
        Sélectionnez une situation pour commencer à pratiquer
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {SCENARIOS.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onSelect={handleSelect}
            disabled={loading}
          />
        ))}
      </div>
      {loading && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Préparation de la conversation...
        </div>
      )}
    </div>
  );
}
