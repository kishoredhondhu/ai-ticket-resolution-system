import { ReactElement } from "react";

import { render, RenderOptions } from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";

import { TicketProvider } from "../context/TicketContext";

// Custom render function with all providers

interface AllProvidersProps {
  children: React.ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  return (
    <MemoryRouter>
      <TicketProvider>{children}</TicketProvider>
    </MemoryRouter>
  );
}

const customRender = (
  ui: ReactElement,

  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing library

export * from "@testing-library/react";

export { customRender as render };
