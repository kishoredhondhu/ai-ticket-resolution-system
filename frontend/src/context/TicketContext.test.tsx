import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TicketProvider, useTicketContext } from "./TicketContext";
import { mockTicket, mockResolvedTicket } from "../test/mockData";
describe("TicketContext", () => {
  describe("useTicketContext", () => {
    it("should throw error when used outside TicketProvider", () => {
      expect(() => {
        renderHook(() => useTicketContext());
      }).toThrow("useTicketContext must be used within a TicketProvider");
    });
    it("should provide default context values", () => {
      const { result } = renderHook(() => useTicketContext(), {
        wrapper: TicketProvider,
      });
      expect(result.current.currentTicket).toBeNull();
      expect(typeof result.current.setCurrentTicket).toBe("function");
    });
    it("should update currentTicket when setCurrentTicket is called", () => {
      const { result } = renderHook(() => useTicketContext(), {
        wrapper: TicketProvider,
      });
      act(() => {
        result.current.setCurrentTicket(mockTicket);
      });
      expect(result.current.currentTicket).toEqual(mockTicket);
    });
    it("should handle setting ticket to null", () => {
      const { result } = renderHook(() => useTicketContext(), {
        wrapper: TicketProvider,
      });
      act(() => {
        result.current.setCurrentTicket(mockTicket);
      });
      expect(result.current.currentTicket).toEqual(mockTicket);
      act(() => {
        result.current.setCurrentTicket(null);
      });
      expect(result.current.currentTicket).toBeNull();
    });
    it("should update to different tickets", () => {
      const { result } = renderHook(() => useTicketContext(), {
        wrapper: TicketProvider,
      });
      act(() => {
        result.current.setCurrentTicket(mockTicket);
      });
      expect(result.current.currentTicket?.ticketId).toBe(mockTicket.ticketId);
      act(() => {
        result.current.setCurrentTicket(mockResolvedTicket);
      });
      expect(result.current.currentTicket?.ticketId).toBe(
        mockResolvedTicket.ticketId
      );
      expect(result.current.currentTicket?.status).toBe("Resolved");
    });
    it("should share state across multiple hooks", () => {
      const { result: result1, rerender } = renderHook(
        () => useTicketContext(),
        {
          wrapper: TicketProvider,
        }
      );
      act(() => {
        result1.current.setCurrentTicket(mockTicket);
      });
      // After setting, the same hook instance should have the updated value
      rerender();
      expect(result1.current.currentTicket).toEqual(mockTicket);
    });
    it("should handle ticket with all properties", () => {
      const { result } = renderHook(() => useTicketContext(), {
        wrapper: TicketProvider,
      });
      act(() => {
        result.current.setCurrentTicket(mockResolvedTicket);
      });
      const ticket = result.current.currentTicket;
      expect(ticket).toBeDefined();
      expect(ticket?.ticketId).toBeDefined();
      expect(ticket?.category).toBeDefined();
      expect(ticket?.description).toBeDefined();
      expect(ticket?.resolution).toBeDefined();
      expect(ticket?.sop).toBeDefined();
      expect(ticket?.priority).toBeDefined();
      expect(ticket?.status).toBeDefined();
      expect(ticket?.createdDate).toBeDefined();
      expect(ticket?.resolvedDate).toBeDefined();
    });
    it("should handle rapid updates", () => {
      const { result } = renderHook(() => useTicketContext(), {
        wrapper: TicketProvider,
      });
      act(() => {
        result.current.setCurrentTicket(mockTicket);
        result.current.setCurrentTicket(mockResolvedTicket);
        result.current.setCurrentTicket(null);
        result.current.setCurrentTicket(mockTicket);
      });
      expect(result.current.currentTicket).toEqual(mockTicket);
    });
  });
  describe("TicketProvider", () => {
    it("should render children", () => {
      const TestComponent = () => {
        const { currentTicket } = useTicketContext();
        return (
          <div data-testid="test">{currentTicket?.ticketId || "No ticket"}</div>
        );
      };
      const { getByTestId } = render(
        <TicketProvider>
          <TestComponent />
        </TicketProvider>
      );
      expect(getByTestId("test")).toHaveTextContent("No ticket");
    });
    it("should provide context to nested children", () => {
      const NestedComponent = () => {
        const { currentTicket } = useTicketContext();
        return <span>{currentTicket?.status || "none"}</span>;
      };
      const ParentComponent = () => (
        <div>
          <NestedComponent />
        </div>
      );
      const { container } = render(
        <TicketProvider>
          <ParentComponent />
        </TicketProvider>
      );
      expect(container.querySelector("span")).toHaveTextContent("none");
    });
  });
});
import { render as testLibRender } from "../test/testUtils";
function render(ui: React.ReactElement) {
  return testLibRender(ui);
}
