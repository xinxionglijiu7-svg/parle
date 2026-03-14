"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageBubble } from "@/components/conversation/MessageBubble";
import { VoiceRecorder } from "@/components/conversation/VoiceRecorder";
import { useAudioPlayer } from "@/components/conversation/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Square, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  scenarioId: number;
  messages: Message[];
  status: "active" | "completed";
}

export default function ActiveConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { play } = useAudioPlayer();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchConversation = useCallback(async () => {
    if (!token || !params.id) return;

    const res = await fetch(`/api/conversations/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setConversation(data);
    }
  }, [token, params.id]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // Auto-play the latest assistant message on load
  useEffect(() => {
    if (!conversation?.messages.length) return;
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    if (lastMsg && lastMsg.role === "assistant" && conversation.messages.length === 1) {
      handlePlayAudio(lastMsg.content, "msg-0");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  async function handleSendMessage(text: string) {
    if (!token || !params.id || sending) return;
    setSending(true);

    try {
      const res = await fetch(`/api/conversations/${params.id}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: text }),
      });

      if (res.ok) {
        const { agentMessage } = await res.json();
        await fetchConversation();
        // Auto-play agent response
        if (agentMessage) {
          const msgIndex = (conversation?.messages.length || 0) + 1;
          handlePlayAudio(agentMessage.content, `msg-${msgIndex}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  async function handleComplete() {
    if (!token || !params.id || completing) return;
    setCompleting(true);

    try {
      const res = await fetch(`/api/conversations/${params.id}/complete`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        router.push(`/history/${params.id}`);
      }
    } catch (err) {
      console.error(err);
      setCompleting(false);
    }
  }

  async function handlePlayAudio(text: string, messageId: string) {
    const result = await play(text, messageId);
    setPlayingId(result);
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (conversation.status === "completed") {
    router.push(`/history/${conversation.id}`);
    return null;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
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
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin inline mr-1.5" />
              Réflexion...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* End conversation button */}
      <div className="px-4 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleComplete}
          disabled={completing || sending}
        >
          {completing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Square className="h-3.5 w-3.5 mr-1.5" />
              Terminer la conversation
            </>
          )}
        </Button>
      </div>

      {/* Voice input */}
      <VoiceRecorder onTranscript={handleSendMessage} disabled={sending || completing} />
    </div>
  );
}
