import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#131b2e] border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">
                {this.props.fallbackTitle || 'Kutilmagan xatolik yuz berdi'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tizimda vaqtinchalik nosozlik kuzatildi. Iltimos, sahifani yangilang yoki asosiy sahifaga qayting.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 text-left overflow-x-auto max-h-24">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4 text-stone-950" />
                <span>Qayta yuklash</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="px-4 py-2.5 rounded-xl bg-[#18110B] hover:bg-[#22170E] text-stone-300 font-semibold text-xs flex items-center gap-2 border border-amber-950/80 transition-all active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Bosh sahifa</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
