"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Pause, Play, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

type RecordingState = "idle" | "listening" | "paused";

export function VoiceRecorder({ onTranscript, disabled }: VoiceRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [confirmedText, setConfirmedText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recordingStateRef = useRef<RecordingState>("idle");

  // Keep ref in sync with state
  useEffect(() => {
    recordingStateRef.current = recordingState;
  }, [recordingState]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result && result[0]) {
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
      }

      if (finalTranscript) {
        setConfirmedText((prev) => (prev + " " + finalTranscript).trim());
        setInterimText("");
      } else {
        setInterimText(interimTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setError("Accès au microphone refusé. Veuillez autoriser l'accès dans les paramètres.");
      } else if (event.error === "network") {
        setError("Erreur réseau. La reconnaissance vocale nécessite une connexion Internet.");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
        setError("Erreur de reconnaissance vocale.");
      }
      setRecordingState("idle");
    };

    recognition.onend = () => {
      // Auto-restart only when actively listening (not paused or idle)
      if (recordingStateRef.current === "listening") {
        try {
          recognition.start();
        } catch {
          setRecordingState("idle");
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) return;
    setError(null);

    // Request microphone permission explicitly
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately — we only needed the permission
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setError("Accès au microphone refusé. Veuillez autoriser l'accès dans les paramètres.");
      return;
    }

    try {
      setConfirmedText("");
      setInterimText("");
      recognitionRef.current.start();
      setRecordingState("listening");
    } catch {
      setError("Impossible de démarrer la reconnaissance vocale.");
    }
  }, []);

  const pauseListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setRecordingState("paused");
    setInterimText("");
  }, []);

  const resumeListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setRecordingState("listening");
    } catch {
      setError("Impossible de reprendre la reconnaissance vocale.");
    }
  }, []);

  const handleSend = useCallback(() => {
    const fullText = (confirmedText + " " + interimText).trim();
    if (!fullText) return;

    if (recognitionRef.current && recordingState !== "idle") {
      recognitionRef.current.stop();
    }
    setRecordingState("idle");

    onTranscript(fullText);
    setConfirmedText("");
    setInterimText("");
  }, [confirmedText, interimText, recordingState, onTranscript]);

  const displayText = (confirmedText + " " + interimText).trim();

  if (!isSupported) {
    return (
      <div className="px-4 py-3 text-center text-sm text-gray-500">
        La reconnaissance vocale n&apos;est pas supportée par votre navigateur.
        <input
          type="text"
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Tapez votre message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const input = e.currentTarget;
              if (input.value.trim()) {
                onTranscript(input.value.trim());
                input.value = "";
              }
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 px-4 py-3">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      {displayText && (
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 min-h-[40px]">
          {confirmedText}
          {interimText && (
            <span className="text-gray-400">{confirmedText ? " " : ""}{interimText}</span>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        {/* Mic / Resume button */}
        {recordingState === "idle" && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shrink-0"
            onClick={startListening}
            disabled={disabled}
            aria-label="Parler"
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}
        {recordingState === "listening" && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-12 w-12 rounded-full shrink-0 animate-pulse"
            onClick={pauseListening}
            disabled={disabled}
            aria-label="Pause"
          >
            <Pause className="h-5 w-5" />
          </Button>
        )}
        {recordingState === "paused" && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shrink-0 border-blue-300 text-blue-600"
            onClick={resumeListening}
            disabled={disabled}
            aria-label="Reprendre"
          >
            <Play className="h-5 w-5" />
          </Button>
        )}

        <span className="text-xs text-gray-400 flex-1">
          {recordingState === "idle" && "Appuyez pour parler"}
          {recordingState === "listening" && "Parlez maintenant..."}
          {recordingState === "paused" && "En pause — appuyez pour reprendre"}
        </span>

        {displayText && (
          <Button
            type="button"
            size="icon"
            className="h-12 w-12 rounded-full shrink-0"
            onClick={handleSend}
            disabled={disabled}
            aria-label="Envoyer"
          >
            <Send className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
