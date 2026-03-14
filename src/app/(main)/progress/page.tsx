"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SCENARIOS } from "@/mastra/scenarios";
import {
  MessageCircle,
  BookOpen,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
} from "lucide-react";

interface RecentActivity {
  id: string;
  scenarioId: number;
  completedAt: string;
  feedback: {
    grammarErrors: unknown[];
    vocabularySuggestions: unknown[];
  } | null;
}

interface ProgressData {
  totalConversations: number;
  completedConversations: number;
  totalVocabulary: number;
  streak: number;
  grammarTrend: "improving" | "stable" | "declining";
  recentActivity: RecentActivity[];
}

export default function ProgressPage() {
  const router = useRouter();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/progress", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setData(await res.json());
      }
      setLoading(false);
    }

    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        Impossible de charger les données
      </div>
    );
  }

  const trendConfig = {
    improving: {
      label: "En progrès",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    stable: {
      label: "Stable",
      icon: Minus,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
    declining: {
      label: "À améliorer",
      icon: TrendingDown,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  };

  const trend = trendConfig[data.grammarTrend];
  const TrendIcon = trend.icon;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Progrès</h2>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Conversations</span>
            </div>
            <p className="text-2xl font-bold">{data.completedConversations}</p>
            <p className="text-xs text-gray-400">
              {data.totalConversations - data.completedConversations} en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">Vocabulaire</span>
            </div>
            <p className="text-2xl font-bold">{data.totalVocabulary}</p>
            <p className="text-xs text-gray-400">mots appris</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-xs">Série</span>
            </div>
            <p className="text-2xl font-bold">{data.streak}</p>
            <p className="text-xs text-gray-400">
              jour{data.streak > 1 ? "s" : ""} consécutif{data.streak > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className={`flex items-center gap-2 ${trend.color} mb-1`}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-xs">Grammaire</span>
            </div>
            <p className={`text-sm font-semibold ${trend.color}`}>{trend.label}</p>
            <p className="text-xs text-gray-400">tendance des erreurs</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune activité pour le moment</p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((activity) => {
                const scenario = SCENARIOS.find(
                  (s) => s.id === activity.scenarioId,
                );
                const date = activity.completedAt
                  ? new Date(activity.completedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })
                  : "";
                const errors = activity.feedback?.grammarErrors.length || 0;
                const suggestions =
                  activity.feedback?.vocabularySuggestions.length || 0;

                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded"
                    onClick={() => router.push(`/history/${activity.id}`)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {scenario?.name || `Scénario ${activity.scenarioId}`}
                      </p>
                      <p className="text-xs text-gray-400">{date}</p>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500 shrink-0">
                      <span className="text-red-500">{errors} err.</span>
                      <span className="text-amber-500">{suggestions} voc.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
