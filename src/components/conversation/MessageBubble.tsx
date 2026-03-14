"use client";

import { cn } from "@/lib/utils";
import { Volume2 } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  onPlayAudio?: () => void;
  isPlayingAudio?: boolean;
}

export function MessageBubble({
  role,
  content,
  onPlayAudio,
  isPlayingAudio,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-blue-900 text-white rounded-br-md"
            : "bg-gray-100 text-gray-900 rounded-bl-md",
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {!isUser && onPlayAudio && (
          <button
            onClick={onPlayAudio}
            className={cn(
              "mt-1.5 flex items-center gap-1 text-xs transition-colors",
              isPlayingAudio ? "text-blue-600" : "text-gray-400 hover:text-gray-600",
            )}
            aria-label="Écouter"
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>{isPlayingAudio ? "Lecture..." : "Écouter"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
