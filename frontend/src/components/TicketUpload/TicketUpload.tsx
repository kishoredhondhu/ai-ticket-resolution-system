import React from "react";
import TicketUploadForm from "./TicketUploadForm";
/**
 * TicketUpload - Container component for uploading new tickets (text, PDF, image).
 * Includes the upload form and handles layout.
 */
const TicketUpload: React.FC = () => (
  <section className="ticket-upload-section">
    <h2>Submit a New Ticket</h2>
    <TicketUploadForm />
  </section>
);
export default TicketUpload;
