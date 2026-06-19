import React from 'react';

interface Props { children: React.ReactNode; fallback?: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error('ErrorBoundary:', error, info); }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'300px', gap:'16px' }}>
          <div style={{ fontSize:'48px' }}>⚠️</div>
          <h2 style={{ color:'#ef4444' }}>Something went wrong</h2>
          <p style={{ color:'#94a3b8' }}>{this.state.error?.message ?? 'An unexpected error occurred.'}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })} className="btn-primary">
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
