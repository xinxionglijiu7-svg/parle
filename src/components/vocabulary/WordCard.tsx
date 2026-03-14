"use client";

import { Trash2 } from "lucide-react";
import { SCENARIOS } from "@/mastra/scenarios";

interface WordCardProps {
  id: string;
  word: string;
  translation: string;
  context?: string | null;
  scenarioId?: number | null;
  reviewCount: number;
  onDelete: (id: string) => void;
}

export function WordCard({
  id,
  word,
  translation,
  context,
  scenarioId,
  reviewCount,
  onDelete,
}: WordCardProps) {
  const scenario = scenarioId
    ? SCENARIOS.find((s) => s.id === scenarioId)
    : null;

  return (
    <div className="rounded-lg border bg-white p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{word}</p>
          <p className="text-gray-500">{translation || "—"}</p>
        </div>
        <button
          onClick={() => onDelete(id)}
          className="shrink-0 rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
          aria-label="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {context && (
        <p className="mt-1.5 text-xs text-gray-400 italic truncate">
          &ldquo;{context}&rdquo;
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        {scenario && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {scenario.name}
          </span>
        )}
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
          {reviewCount}x révisé
        </span>
      </div>
    </div>
  );
}
