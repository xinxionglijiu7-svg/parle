"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Scenario } from "@/mastra/scenarios";

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: (scenarioId: number) => void;
  disabled?: boolean;
}

export function ScenarioCard({ scenario, onSelect, disabled }: ScenarioCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md active:scale-[0.98]"
      onClick={() => !disabled && onSelect(scenario.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!disabled) onSelect(scenario.id);
        }
      }}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-base">{scenario.name}</CardTitle>
        <CardDescription className="text-sm">
          {scenario.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
