import React from "react";
import { useSimilarTickets } from "../hooks/useSimilarTickets";
const HistoryPage: React.FC = () => {
  const { tickets } = useSimilarTickets({ statusFilter: "Closed" });
  return (
    <div className="history-page">
      <h1>Ticket Resolution History</h1>
      <ul>
        {tickets.map((ticket) => (
          <li key={ticket.ticketId}>
            <strong>{ticket.category}:</strong> {ticket.description} <br />
            <span>
              Status: {ticket.status} | Resolution Date:{" "}
              {ticket.resolvedDate || "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default HistoryPage;
