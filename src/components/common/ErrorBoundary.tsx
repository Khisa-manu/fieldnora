import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Fieldnora ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0B1118] text-[#F1F5F9] font-sans antialiased">
          <div className="max-w-md w-full bg-[#111A24] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected UI state occurred in the application. Your local workspace state and stored data are safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-[#0B1118] border border-[#1E293B] text-left overflow-auto max-h-32 text-[11px] font-mono text-rose-300/90">
                {this.state.error.message || 'Unknown error'}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('fieldnora_auth');
                  window.location.reload();
                }}
                className="py-2.5 px-4 rounded-xl bg-[#16202C] hover:bg-[#1E293B] text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reset to Login</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
