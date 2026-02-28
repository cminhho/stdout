import { Component, type ErrorInfo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "stdout-errors";

interface ToolErrorBoundaryProps {
  children: ReactNode;
  toolId: string;
  toolLabel?: string;
}

interface ToolErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary scoped to a single tool. When this tool throws, only this
 * block shows the fallback; the rest of the app (sidebar, other routes) stays usable.
 * Logs errors locally (localStorage) for debugging; no server reporting.
 */
export class ToolErrorBoundaryClass extends Component<ToolErrorBoundaryProps, ToolErrorBoundaryState> {
  state: ToolErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): Partial<ToolErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { toolId } = this.props;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: Array<{ toolId: string; timestamp: number }> = raw ? JSON.parse(raw) : [];
      list.push({ toolId, timestamp: Date.now() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
    if (import.meta.env.DEV) {
      console.error(`[ToolErrorBoundary ${toolId}]`, error, errorInfo);
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <ToolErrorFallback
          error={this.state.error}
          toolLabel={this.props.toolLabel ?? this.props.toolId}
          onRetry={this.reset}
        />
      );
    }
    return this.props.children;
  }
}

function ToolErrorFallback({
  error,
  toolLabel,
  onRetry,
}: {
  error: Error;
  toolLabel: string;
  onRetry: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 min-h-0 items-center justify-center p-6">
      <div className="flex flex-col items-center text-center max-w-md gap-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold">
          Tool &quot;{toolLabel}&quot; encountered an error
        </h2>
        <p className="text-muted-foreground text-sm">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onRetry} className="cursor-pointer">
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
            Try again
          </Button>
          <Button onClick={() => navigate("/")} className="cursor-pointer">
            <Home className="h-4 w-4 mr-2" aria-hidden />
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Wraps a single tool so a crash in that tool only shows the tool fallback,
 * not the whole app. Use one per tool route.
 */
export function ToolErrorBoundary({
  children,
  toolId,
  toolLabel,
}: ToolErrorBoundaryProps) {
  return (
    <ToolErrorBoundaryClass toolId={toolId} toolLabel={toolLabel}>
      {children}
    </ToolErrorBoundaryClass>
  );
}
