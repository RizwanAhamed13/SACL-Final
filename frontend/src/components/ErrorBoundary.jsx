import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#6b7280' }}>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}
                  style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
