"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { MessageBubble } from "@/components/conversation/MessageBubble";
import { FeedbackPanel } from "@/components/feedback/FeedbackPanel";
import { useAudioPlayer } from "@/components/conversation/AudioPlayer";
import { Loader2 } from "lucide-react";
import { SCENARIOS } from "@/mastra/scenarios";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  scenarioId: number;
  messages: Message[];
  status: string;
  createdAt: string;
}

interface Feedback {
  grammarErrors: { original: string; correction: string; explanation: string }[];
  vocabularySuggestions: { used: string; suggested: string; context: string }[];
  pronunciationNotes: string[];
  keyPhrases: string[];
  overallComment: string;
}

export default function HistoryDetailPage() {
  const params = useParams<{ id: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { play } = useAudioPlayer();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchData = useCallback(async () => {
    if (!token || !params.id) return;

    const headers = { Authorization: `Bearer ${token}` };

    const [convRes, feedbackRes] = await Promise.all([
      fetch(`/api/conversations/${params.id}`, { headers }),
      fetch(`/api/feedback/${params.id}`, { headers }),
    ]);

    if (convRes.ok) {
      setConversation(await convRes.json());
    }
    if (feedbackRes.ok) {
      setFeedback(await feedbackRes.json());
    }

    setLoading(false);
  }, [token, params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handlePlayAudio(text: string, messageId: string) {
    const result = await play(text, messageId);
    setPlayingId(result);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-6 text-center text-gray-500">
        Conversation introuvable
      </div>
    );
  }

  const scenario = SCENARIOS.find((s) => s.id === conversation.scenarioId);
  const date = new Date(conversation.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold">
          {scenario?.name || `Scénario ${conversation.scenarioId}`}
        </h2>
        <p className="text-sm text-gray-500">{date}</p>
      </div>

      {/* Transcript */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Transcription
        </h3>
        <div className="space-y-3">
          {conversation.messages.map((msg, i) => (
            <MessageBubble
              key={`msg-${i}`}
              role={msg.role as "user" | "assistant"}
              content={msg.content}
              onPlayAudio={
                msg.role === "assistant"
                  ? () => handlePlayAudio(msg.content, `msg-${i}`)
                  : undefined
              }
              isPlayingAudio={playingId === `msg-${i}`}
            />
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Feedback
          </h3>
          <FeedbackPanel feedback={feedback} />
        </div>
      )}
    </div>
  );
}
