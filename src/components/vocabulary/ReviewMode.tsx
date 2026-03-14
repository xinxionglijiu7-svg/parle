"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Eye, Trophy } from "lucide-react";

interface ReviewWord {
  id: string;
  word: string;
  translation: string;
  context?: string | null;
}

interface ReviewModeProps {
  words: ReviewWord[];
  onReview: (id: string, known: boolean) => Promise<void>;
  onFinish: () => void;
}

export function ReviewMode({ words, onReview, onFinish }: ReviewModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ known: number; unknown: number }>({
    known: 0,
    unknown: 0,
  });
  const [reviewing, setReviewing] = useState(false);

  if (words.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-2">Aucun mot à réviser pour le moment</p>
        <p className="text-sm text-gray-400">
          Revenez plus tard ou ajoutez de nouveaux mots
        </p>
      </div>
    );
  }

  // Session complete
  if (currentIndex >= words.length) {
    const total = results.known + results.unknown;
    const percentage = total > 0 ? Math.round((results.known / total) * 100) : 0;

    return (
      <div className="text-center py-8 space-y-4">
        <Trophy className="h-12 w-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold">Session terminée !</h3>
        <div className="space-y-1 text-sm">
          <p className="text-green-600">{results.known} mot{results.known > 1 ? "s" : ""} connu{results.known > 1 ? "s" : ""}</p>
          <p className="text-red-500">{results.unknown} mot{results.unknown > 1 ? "s" : ""} à revoir</p>
          <p className="text-gray-500 font-medium">{percentage}% de réussite</p>
        </div>
        <Button onClick={onFinish} className="mt-4">
          Retour au vocabulaire
        </Button>
      </div>
    );
  }

  const current = words[currentIndex];
  if (!current) return null;

  async function handleAnswer(known: boolean) {
    if (reviewing || !current) return;
    setReviewing(true);

    await onReview(current.id, known);

    setResults((prev) => ({
      known: prev.known + (known ? 1 : 0),
      unknown: prev.unknown + (known ? 0 : 1),
    }));

    setRevealed(false);
    setCurrentIndex((prev) => prev + 1);
    setReviewing(false);
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {currentIndex + 1} / {words.length}
        </span>
        <span className="text-green-600">{results.known} connu{results.known > 1 ? "s" : ""}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <Card className="min-h-[200px] flex items-center justify-center">
        <CardContent className="text-center py-8 w-full">
          <p className="text-2xl font-bold mb-4">{current.word}</p>

          {revealed ? (
            <div className="space-y-2">
              <p className="text-lg text-gray-600">{current.translation || "—"}</p>
              {current.context && (
                <p className="text-sm text-gray-400 italic">
                  &ldquo;{current.context}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevealed(true)}
            >
              <Eye className="h-4 w-4 mr-1.5" />
              Révéler
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Answer buttons */}
      {revealed && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => handleAnswer(false)}
            disabled={reviewing}
          >
            <X className="h-4 w-4 mr-1.5" />
            À revoir
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => handleAnswer(true)}
            disabled={reviewing}
          >
            <Check className="h-4 w-4 mr-1.5" />
            Connu
          </Button>
        </div>
      )}
    </div>
  );
}
