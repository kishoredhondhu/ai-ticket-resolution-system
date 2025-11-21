import { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TicketProvider } from "../context/TicketContext";
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) =>
  render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <TicketProvider>{children}</TicketProvider>
      </MemoryRouter>
    ),
    ...options,
  });
// Re-export everything from testing library
// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";
// Override render method with our own
export { customRender as render };
