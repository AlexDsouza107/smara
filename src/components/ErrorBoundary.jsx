import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error in app:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#fbf7ed] px-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-gray-600">
              This page hit an unexpected error. Reloading usually fixes it.
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-3 bg-brand-purple-600 text-white rounded-lg hover:bg-brand-purple-700 font-medium"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
