import React from "react";
import type { Ticket } from "../../types/ticketTypes";
import SimilarTicketCard from "./SimilarTicketCard";
import "./SimilarTicketsList.css";
interface Props {
  tickets: Ticket[];
}
const SimilarTicketsList: React.FC<Props> = ({ tickets }) => {
  // Ensure tickets is always an array
  const ticketArray = Array.isArray(tickets) ? tickets : [];
  return (
    <section className="similar-tickets-section">
      <div className="ticket-list">
        {ticketArray.length > 0 ? (
          ticketArray.map((ticket) => (
            <SimilarTicketCard key={ticket.ticketId} ticket={ticket} />
          ))
        ) : (
          <div className="no-tickets-message">
            <div className="no-tickets-icon">🎫</div>
            <p>No similar tickets found.</p>
          </div>
        )}
      </div>
    </section>
  );
};
export default SimilarTicketsList;
