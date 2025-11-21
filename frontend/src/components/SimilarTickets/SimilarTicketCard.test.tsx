import { describe, it, expect } from "vitest";
import { render, screen } from "../../test/testUtils";
import SimilarTicketCard from "./SimilarTicketCard";
import { mockTicket, mockResolvedTicket } from "../../test/mockData";
describe("SimilarTicketCard", () => {
  it("should render ticket information", () => {
    render(<SimilarTicketCard ticket={mockTicket} />);
    expect(screen.getByText(mockTicket.category)).toBeInTheDocument();
    expect(screen.getByText(mockTicket.description)).toBeInTheDocument();
    expect(screen.getByText(mockTicket.priority)).toBeInTheDocument();
    expect(screen.getByText(mockTicket.status)).toBeInTheDocument();
  });
  it("should display ticket ID", () => {
    render(<SimilarTicketCard ticket={mockTicket} />);
    expect(
      screen.getByText(`Ticket ID: ${mockTicket.ticketId}`)
    ).toBeInTheDocument();
  });
  it("should display resolution when available", () => {
    render(<SimilarTicketCard ticket={mockResolvedTicket} />);
    expect(screen.getByText(mockResolvedTicket.resolution)).toBeInTheDocument();
  });
  it("should apply priority class", () => {
    const { container } = render(<SimilarTicketCard ticket={mockTicket} />);
    const priorityElement = container.querySelector(
      `.priority.${mockTicket.priority.toLowerCase()}`
    );
    expect(priorityElement).toBeInTheDocument();
  });
  it("should apply status class", () => {
    const { container } = render(<SimilarTicketCard ticket={mockTicket} />);
    const statusElement = container.querySelector(
      `.ticket-status.${mockTicket.status.toLowerCase()}`
    );
    expect(statusElement).toBeInTheDocument();
  });
  it("should have proper aria-label", () => {
    render(<SimilarTicketCard ticket={mockTicket} />);
    const card = screen.getByLabelText(`Similar Ticket ${mockTicket.ticketId}`);
    expect(card).toBeInTheDocument();
  });
  it("should render with different priorities", () => {
    const priorities: Array<"High" | "Medium" | "Low" | "Critical"> = [
      "High",
      "Medium",
      "Low",
      "Critical",
    ];
    priorities.forEach((priority) => {
      const ticket = { ...mockTicket, priority };
      const { container } = render(<SimilarTicketCard ticket={ticket} />);
      expect(
        container.querySelector(`.priority.${priority.toLowerCase()}`)
      ).toBeInTheDocument();
    });
  });
  it("should not display resolution section when resolution is empty", () => {
    const ticketWithoutResolution = { ...mockTicket, resolution: "" };
    render(<SimilarTicketCard ticket={ticketWithoutResolution} />);
    expect(screen.queryByText("Resolution")).not.toBeInTheDocument();
  });
});
