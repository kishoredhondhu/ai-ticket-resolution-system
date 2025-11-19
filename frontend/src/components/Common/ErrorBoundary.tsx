import React from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);

    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  //componentDidCatch(error: Error, info: ErrorInfo) { /* log error */ }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong. Please refresh or contact support.</h2>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
