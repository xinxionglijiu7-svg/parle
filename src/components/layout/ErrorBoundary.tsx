"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
          <h2 className="text-lg font-semibold mb-1">
            Une erreur est survenue
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Quelque chose s&apos;est mal passé. Veuillez réessayer.
          </p>
          <Button
            variant="outline"
            onClick={() => this.setState({ hasError: false })}
          >
            Réessayer
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
