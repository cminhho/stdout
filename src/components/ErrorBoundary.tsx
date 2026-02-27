import { Component, type ErrorInfo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  /** Optional callback when error is caught (e.g. for logging). */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Class component required for React error boundaries.
 * Renders children until an error is thrown; then shows a friendly recovery UI.
 */
export class ErrorBoundaryClass extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

function ErrorFallback({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 min-h-0 items-center justify-center p-6">
      <div className="flex flex-col items-center text-center max-w-md gap-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
            Try again
          </Button>
          <Button onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-2" aria-hidden />
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Wraps children with ErrorBoundaryClass and provides useNavigate to the fallback.
 * Must be used inside a Router (BrowserRouter / HashRouter).
 */
export function ErrorBoundary({ children, onError }: Props) {
  return (
    <ErrorBoundaryClass onError={onError}>
      {children}
    </ErrorBoundaryClass>
  );
}
