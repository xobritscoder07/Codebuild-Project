import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in React component tree:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
          padding: '40px',
          textAlign: 'center',
          background: '#f8faf9',
          color: '#122331'
        }}>
          <div style={{ width: 64, height: 64, background: 'rgba(217,79,92,0.1)', color: '#d94f5c', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16, fontSize: 32, marginBottom: 24, fontWeight: 'bold' }}>!</div>
          <h1 style={{ margin: '0 0 16px', fontSize: 24, fontWeight: 800 }}>Something went wrong.</h1>
          <p style={{ margin: '0 0 32px', color: '#61717c', maxWidth: 400, lineHeight: 1.6 }}>
            The application encountered an unexpected error. Our systems have been notified. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#0e9f92',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(14,159,146,0.2)'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
