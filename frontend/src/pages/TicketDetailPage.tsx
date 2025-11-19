import React from "react";

import { useParams } from "react-router-dom";

import ResolutionPanel from "../components/ResolutionSuggestion/ResolutionPanel";

import ResolutionFeedback from "../components/Feedback/ResolutionFeedback";

import { useResolutionSuggestion } from "../hooks/useResolutionSuggestion";

const TicketDetailPage: React.FC = () => {
  const { id } = useParams();

  const { suggestion, rationale, overrideResolution } =
    useResolutionSuggestion(id);

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
