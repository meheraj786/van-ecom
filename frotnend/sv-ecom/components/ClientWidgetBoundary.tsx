"use client";

import React from "react";

interface ClientWidgetBoundaryProps {
  name: string;
  children: React.ReactNode;
}

interface ClientWidgetBoundaryState {
  hasError: boolean;
}

export class ClientWidgetBoundary extends React.Component<
  ClientWidgetBoundaryProps,
  ClientWidgetBoundaryState
> {
  state: ClientWidgetBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ClientWidgetBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[client-widget:${this.props.name}]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
