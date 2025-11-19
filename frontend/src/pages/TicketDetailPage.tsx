import React from "react";

import ResolutionPanel from "../components/ResolutionSuggestion/ResolutionPanel";

import ResolutionFeedback from "../components/Feedback/ResolutionFeedback";

import { useResolutionSuggestion } from "../hooks/useResolutionSuggestion";

const TicketDetailPage: React.FC = () => {
  const { suggestion, rationale, overrideResolution } =
    useResolutionSuggestion();

  return (
    <div className="ticket-detail-page">
      <h1>Ticket Details</h1>

      <ResolutionPanel
        suggestion={suggestion}
        rationale={rationale}
        onOverride={overrideResolution}
      />

      <ResolutionFeedback
        onSubmit={() => {
          /* send to backend */
        }}
      />
    </div>
  );
};

export default TicketDetailPage;
