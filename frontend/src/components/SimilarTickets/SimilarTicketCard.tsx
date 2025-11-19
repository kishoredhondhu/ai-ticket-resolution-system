import React from "react";

import type { Ticket } from "../../types/ticketTypes";

import "./SimilarTicketCard.css";

interface Props {
  ticket: Ticket;
}

const SimilarTicketCard: React.FC<Props> = ({ ticket }) => (
  <div className="ticket-card" aria-label={`Similar Ticket ${ticket.ticketId}`}>
    <div className="ticket-header">
      <div className="ticket-category">
        <strong>Category:</strong>

        <span className="ticket-category-value">{ticket.category}</span>
      </div>

      <span className={`priority ${ticket.priority.toLowerCase()}`}>
        {ticket.priority}
      </span>
    </div>

    <div className="ticket-description">
      <strong>Description</strong>

      <div className="ticket-description-text">{ticket.description}</div>
    </div>

    <div className="ticket-meta">
      <div className="ticket-meta-item">
        <strong>Status</strong>

        <span
          className={`ticket-status ${ticket.status
            .toLowerCase()
            .replace(" ", "-")}`}
        >
          {ticket.status}
        </span>
      </div>

      {ticket.resolution && (
        <div className="ticket-meta-item">
          <strong>Resolution</strong>

          <span>{ticket.resolution}</span>
        </div>
      )}
    </div>

    <p className="ticket-id">Ticket ID: {ticket.ticketId}</p>
  </div>
);

export default SimilarTicketCard;
