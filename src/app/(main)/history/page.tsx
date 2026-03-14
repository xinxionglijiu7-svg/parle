"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SCENARIOS } from "@/mastra/scenarios";
import { Loader2, MessageCircle, CheckCircle2 } from "lucide-react";

interface ConversationSummary {
  id: string;
  scenarioId: number;
  status: "active" | "completed";
  createdAt: string;
  completedAt: string | null;
}

export default function HistoryPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setConversations(await res.json());
      }
      setLoading(false);
    }

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-2">Aucune conversation pour le moment</p>
        <p className="text-sm text-gray-400">
          Commencez une conversation pour la voir apparaître ici
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-1">Historique</h2>
      <p className="text-sm text-gray-500 mb-4">
        {conversations.length} conversation{conversations.length > 1 ? "s" : ""}
      </p>
      <div className="space-y-3">
        {conversations.map((conv) => {
          const scenario = SCENARIOS.find((s) => s.id === conv.scenarioId);
          const date = new Date(conv.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          const isCompleted = conv.status === "completed";

          return (
            <Card
              key={conv.id}
              className="cursor-pointer transition-shadow hover:shadow-md active:scale-[0.99]"
              onClick={() =>
                router.push(
                  isCompleted
                    ? `/history/${conv.id}`
                    : `/conversation/${conv.id}`,
                )
              }
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {scenario?.name || `Scénario ${conv.scenarioId}`}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {date}
                    </CardDescription>
                  </div>
                  <div className="shrink-0">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Terminée
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                        <MessageCircle className="h-3 w-3" />
                        En cours
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
