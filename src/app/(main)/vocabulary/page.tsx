"use client";

import { useState, useEffect, useCallback } from "react";
import { WordCard } from "@/components/vocabulary/WordCard";
import { ReviewMode } from "@/components/vocabulary/ReviewMode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, GraduationCap, Plus, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VocabWord {
  id: string;
  word: string;
  translation: string;
  context: string | null;
  scenarioId: number | null;
  reviewCount: number;
  lastReviewedAt: string | null;
}

type Mode = "browse" | "review";

export default function VocabularyPage() {
  const [mode, setMode] = useState<Mode>("browse");
  const [words, setWords] = useState<VocabWord[]>([]);
  const [reviewWords, setReviewWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newTranslation, setNewTranslation] = useState("");
  const [addError, setAddError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token],
  );

  const fetchWords = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    const params = new URLSearchParams();
    if (search) params.set("search", search);

    const res = await fetch(`/api/vocabulary?${params}`, {
      headers: headers(),
    });

    if (res.ok) {
      const data = await res.json();
      setWords(data.words);
    }
    setLoading(false);
  }, [token, search, headers]);

  const fetchReviewWords = useCallback(async () => {
    if (!token) return;

    const res = await fetch("/api/vocabulary?mode=review", {
      headers: headers(),
    });

    if (res.ok) {
      const data = await res.json();
      setReviewWords(data.words);
    }
  }, [token, headers]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  async function handleAdd() {
    if (!newWord.trim() || !newTranslation.trim()) {
      setAddError("Mot et traduction requis");
      return;
    }

    const res = await fetch("/api/vocabulary", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ word: newWord, translation: newTranslation }),
    });

    if (res.ok) {
      setNewWord("");
      setNewTranslation("");
      setAddError("");
      setDialogOpen(false);
      fetchWords();
    } else {
      const data = await res.json();
      setAddError(data.error || "Erreur");
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/vocabulary/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    setWords((prev) => prev.filter((w) => w.id !== id));
  }

  async function handleReview(id: string, known: boolean) {
    await fetch(`/api/vocabulary/${id}/review`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ known }),
    });
  }

  function startReview() {
    fetchReviewWords().then(() => setMode("review"));
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Vocabulaire</h2>
        <div className="flex gap-2">
          <Button
            variant={mode === "browse" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode("browse");
              fetchWords();
            }}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Parcourir
          </Button>
          <Button
            variant={mode === "review" ? "default" : "outline"}
            size="sm"
            onClick={startReview}
          >
            <GraduationCap className="h-4 w-4 mr-1" />
            Réviser
          </Button>
        </div>
      </div>

      {mode === "browse" && (
        <>
          {/* Search + Add */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Rechercher un mot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" aria-label="Ajouter un mot">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un mot</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Mot en français</label>
                    <Input
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      placeholder="ex: néanmoins"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Traduction</label>
                    <Input
                      value={newTranslation}
                      onChange={(e) => setNewTranslation(e.target.value)}
                      placeholder="ex: それにもかかわらず"
                    />
                  </div>
                  {addError && (
                    <p className="text-sm text-red-600">{addError}</p>
                  )}
                  <Button className="w-full" onClick={handleAdd}>
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Word count */}
          <p className="text-sm text-gray-500 mb-3">
            {words.length} mot{words.length > 1 ? "s" : ""}
          </p>

          {/* Word list */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : words.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-1">Aucun mot trouvé</p>
              <p className="text-sm text-gray-400">
                {search
                  ? "Essayez un autre terme de recherche"
                  : "Les mots seront ajoutés automatiquement après vos conversations"}
              </p>
            </div>
          ) : (
            <div className={cn("grid gap-2", "sm:grid-cols-2")}>
              {words.map((w) => (
                <WordCard
                  key={w.id}
                  id={w.id}
                  word={w.word}
                  translation={w.translation}
                  context={w.context}
                  scenarioId={w.scenarioId}
                  reviewCount={w.reviewCount}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {mode === "review" && (
        <ReviewMode
          words={reviewWords}
          onReview={handleReview}
          onFinish={() => {
            setMode("browse");
            fetchWords();
          }}
        />
      )}
    </div>
  );
}
