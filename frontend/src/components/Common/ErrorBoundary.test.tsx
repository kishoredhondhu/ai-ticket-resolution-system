import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

import { render, screen } from "../../test/testUtils";

import ErrorBoundary from "./ErrorBoundary";

// Component that throws an error

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }

  return <div>No error</div>;
};

describe("ErrorBoundary", () => {
  // Suppress console.error for these tests

  const originalError = console.error;

  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it("should render children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should render error message when child throws error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

    expect(screen.getByText(/refresh or contact support/i)).toBeInTheDocument();
  });

  it("should not render children when error is caught", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText("No error")).not.toBeInTheDocument();
  });

  it("should render multiple children when no error", () => {
    render(
      <ErrorBoundary>
        <div>First child</div>

        <div>Second child</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("First child")).toBeInTheDocument();

    expect(screen.getByText("Second child")).toBeInTheDocument();
  });

  it("should display error heading as h2", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const heading = screen.getByRole("heading", { level: 2 });

    expect(heading).toBeInTheDocument();
  });
});
