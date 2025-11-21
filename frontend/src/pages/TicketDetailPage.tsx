import React from "react";
import ResolutionPanel from "../components/ResolutionSuggestion/ResolutionPanel";
import ResolutionFeedback from "../components/Feedback/ResolutionFeedback";
import { useResolutionSuggestion } from "../hooks/useResolutionSuggestion";
import "./TicketDetailPage.css";

const TicketDetailPage: React.FC = () => {
  const { suggestion, rationale, overrideResolution } = useResolutionSuggestion();
  return (
    <div className="ticket-detail-page container">
      <header className="ticket-detail-header">
        <h1>Ticket Details</h1>
        <p className="ticket-detail-subtitle">Review AI suggestions and refine the resolution before finalizing.</p>
      </header>
      <div className="ticket-detail-content grid-3">
        <div className="ticket-panel-wrapper card">
          <ResolutionPanel
            suggestion={suggestion}
            rationale={rationale}
            onOverride={overrideResolution}
          />
        </div>
        <div className="ticket-feedback-wrapper card">
          <ResolutionFeedback
            onSubmit={() => {
              /* send to backend */
            }}
          />
        </div>
        <div className="ticket-meta-wrapper card">
          <h3>Metadata</h3>
          <p className="meta-info">Additional contextual data about this ticket will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
