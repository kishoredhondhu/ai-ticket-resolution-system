import { describe, it, expect, vi } from "vitest";
import { render, screen } from "./test/testUtils";
import App from "./App";
// Mock the page components
vi.mock("./pages/DashboardPage", () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));
vi.mock("./pages/TicketDetailPage", () => ({
  default: () => <div data-testid="ticket-detail-page">Ticket Detail Page</div>,
}));
vi.mock("./pages/HistoryPage", () => ({
  default: () => <div data-testid="history-page">History Page</div>,
}));
describe("App", () => {
  it("should render app header with logo", () => {
    render(<App />);
    expect(
      screen.getByRole("link", { name: "TicketGenie" })
    ).toBeInTheDocument();
  });
  it("should render navigation links", () => {
    render(<App />);
    expect(
      screen.getByRole("link", { name: /Dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /History/i })).toBeInTheDocument();
  });
  it("should render footer", () => {
    render(<App />);
    expect(screen.getByText(/AI-Powered IT Support/i)).toBeInTheDocument();
    expect(screen.getByText(/2025/i)).toBeInTheDocument();
  });
  it("should render dashboard page by default", () => {
    render(<App />);
    expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
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
  it("should link to history page", () => {
    render(<App />);
    const historyLink = screen.getByRole("link", { name: /History/i });
    expect(historyLink).toHaveAttribute("href", "/history");
  });
});
