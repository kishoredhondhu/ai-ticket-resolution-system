import { createContext, useState, useContext } from "react";

import type { ReactNode } from "react";

import type { Ticket } from "../types/ticketTypes";

interface TicketContextType {
  currentTicket: Ticket | null;

  setCurrentTicket: (ticket: Ticket | null) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components

export const useTicketContext = () => {
  const context = useContext(TicketContext);

  if (!context) {
    throw new Error("useTicketContext must be used within a TicketProvider");
  }

  return context;
};

export function TicketProvider({ children }: { children: ReactNode }) {
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);

  return (
    <TicketContext.Provider value={{ currentTicket, setCurrentTicket }}>
      {children}
    </TicketContext.Provider>
  );
}
