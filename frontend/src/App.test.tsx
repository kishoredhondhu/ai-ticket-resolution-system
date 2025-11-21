import { describe, it, expect, vi } from "vitest";

import { render, screen } from "./test/testUtils";

import App from "./App";

// Only mock remaining routed page components (Dashboard & History removed)
vi.mock("./pages/TicketDetailPage", () => ({
  default: () => <div data-testid="ticket-detail-page">Ticket Detail Page</div>,
}));

describe("App", () => {
  it("should render app header with logo", () => {
    render(<App />);

    expect(
      screen.getByRole("link", { name: "TicketGenie" })
    ).toBeInTheDocument();
  });

  // Navigation links removed per user request; test intentionally omitted.

  it("should render footer", () => {
    render(<App />);

    expect(screen.getByText(/AI-Powered IT Support/i)).toBeInTheDocument();

    expect(screen.getByText(/2025/i)).toBeInTheDocument();
  });

  it("should render home placeholder by default", () => {
    render(<App />);
    expect(screen.getByText(/Welcome to TicketGenie/i)).toBeInTheDocument();
  });

  it("should have app class", () => {
    const { container } = render(<App />);

    expect(container.querySelector(".app")).toBeInTheDocument();
  });

  it("should have app-header class", () => {
    const { container } = render(<App />);

    expect(container.querySelector(".app-header")).toBeInTheDocument();
  });

  it("should have app-main class", () => {
    const { container } = render(<App />);

    expect(container.querySelector(".app-main")).toBeInTheDocument();
  });

  it("should have app-footer class", () => {
    const { container } = render(<App />);

    expect(container.querySelector(".app-footer")).toBeInTheDocument();
  });

  it("should link to home page", () => {
    render(<App />);

    const logoLink = screen.getByRole("link", { name: /TicketGenie/i });

    expect(logoLink).toHaveAttribute("href", "/");
  });

  // History link removed; test removed.
});
