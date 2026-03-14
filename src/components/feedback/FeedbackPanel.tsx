"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Lightbulb, Volume2, BookOpen, MessageSquare } from "lucide-react";

interface GrammarError {
  original: string;
  correction: string;
  explanation: string;
}

interface VocabularySuggestion {
  used: string;
  suggested: string;
  context: string;
}

interface FeedbackData {
  grammarErrors: GrammarError[];
  vocabularySuggestions: VocabularySuggestion[];
  pronunciationNotes: string[];
  keyPhrases: string[];
  overallComment: string;
}

interface FeedbackPanelProps {
  feedback: FeedbackData;
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  return (
    <div className="space-y-4">
      {/* Overall Comment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            Commentaire général
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-gray-700">
            {feedback.overallComment}
          </p>
        </CardContent>
      </Card>

      {/* Grammar Errors */}
      {feedback.grammarErrors.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Erreurs de grammaire
              <span className="text-xs font-normal text-gray-400">
                ({feedback.grammarErrors.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedback.grammarErrors.map((error, i) => (
              <div key={i} className="rounded-lg bg-red-50 p-3 text-sm">
                <div className="flex flex-col gap-1">
                  <p className="text-red-700 line-through">{error.original}</p>
                  <p className="font-medium text-green-700">{error.correction}</p>
                </div>
                <p className="mt-1.5 text-xs text-gray-600">{error.explanation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Vocabulary Suggestions */}
      {feedback.vocabularySuggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Suggestions de vocabulaire
              <span className="text-xs font-normal text-gray-400">
                ({feedback.vocabularySuggestions.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedback.vocabularySuggestions.map((suggestion, i) => (
              <div key={i} className="rounded-lg bg-amber-50 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{suggestion.used}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium text-amber-800">
                    {suggestion.suggested}
                  </span>
                </div>
                {suggestion.context && (
                  <p className="mt-1 text-xs text-gray-500 italic">
                    &ldquo;{suggestion.context}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pronunciation Notes */}
      {feedback.pronunciationNotes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Volume2 className="h-4 w-4 text-purple-500" />
              Notes de prononciation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.pronunciationNotes.map((note, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-purple-400 shrink-0">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Key Phrases */}
      {feedback.keyPhrases.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-green-600" />
              Expressions clés à retenir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {feedback.keyPhrases.map((phrase, i) => (
                <span
                  key={i}
                  className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-800 border border-green-200"
                >
                  {phrase}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
