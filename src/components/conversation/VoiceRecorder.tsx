"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscript, disabled }: VoiceRecorderProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

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

      setTranscript((prev) => {
        if (finalTranscript) {
          return (prev + " " + finalTranscript).trim();
        }
        return prev + (interimTranscript ? " " + interimTranscript : "");
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const handleSend = useCallback(() => {
    if (!transcript.trim()) return;

    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    onTranscript(transcript.trim());
    setTranscript("");
  }, [transcript, isListening, onTranscript]);

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
      {transcript && (
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 min-h-[40px]">
          {transcript}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          className={cn("h-12 w-12 rounded-full shrink-0", isListening && "animate-pulse")}
          onClick={toggleListening}
          disabled={disabled}
          aria-label={isListening ? "Arrêter" : "Parler"}
        >
          {isListening ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
        <span className="text-xs text-gray-400 flex-1">
          {isListening ? "Parlez maintenant..." : "Appuyez pour parler"}
        </span>
        {transcript.trim() && (
          <Button
            type="button"
            size="icon"
            className="h-12 w-12 rounded-full shrink-0"
            onClick={handleSend}
            aria-label="Envoyer"
          >
            <Send className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
