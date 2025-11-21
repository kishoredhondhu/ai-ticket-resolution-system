import { useState, useEffect } from "react";
import { getAllTickets } from "../api/ticketApi";
import type { Ticket } from "../types/ticketTypes";
export function useSimilarTickets(options?: {
  statusFilter?: string;
  enabled?: boolean;
}) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    // Skip fetching if explicitly disabled
    if (options?.enabled === false) {
      setTickets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getAllTickets()
      .then((data) => {
        // Ensure data is an array
        const ticketArray = Array.isArray(data) ? data : [];
        let filtered = ticketArray;
        if (options?.statusFilter) {
          filtered = ticketArray.filter(
            (t) => t.status === options.statusFilter
          );
        }
        setTickets(filtered);
      })
      .catch((err) => {
        console.error("Error fetching tickets:", err);
        setError(err);
        setTickets([]); // Set to empty array on error
      })
      .finally(() => setLoading(false));
  }, [options?.statusFilter, options?.enabled]);
  return { tickets, loading, error };
}
