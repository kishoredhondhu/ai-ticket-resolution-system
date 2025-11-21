import { useState } from "react";
import {
  getResolutionSuggestion,
  type ResolutionResponse,
  type SimilarTicket,
} from "../api/resolutionApi";
export function useResolutionSuggestion() {
  const [suggestion, setSuggestion] = useState("");
  const [rationale, setRationale] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [similarTickets, setSimilarTickets] = useState<SimilarTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function fetchResolution(
    category: string,
    priority: string,
    description: string
  ) {
    setLoading(true);
    setError(null);
    setSuggestion("");
    setRationale("");
    setConfidence(0);
    setSimilarTickets([]);
    try {
      const response: ResolutionResponse = await getResolutionSuggestion(
        category,
        priority,
        description
      );
      setSuggestion(response.suggested_resolution);
      setConfidence(response.confidence);
      setSimilarTickets(response.similar_tickets);
      // Set rationale based on method and metadata
      const rationale =
        `Resolution generated using ${response.method.toUpperCase()} method with ${(
          response.confidence * 100
        ).toFixed(1)}% confidence. ` +
        `Found ${response.similar_tickets.length} similar ticket(s) in knowledge base.`;
      setRationale(rationale);
      setLoading(false);
      setError(null);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch resolution";
      setSuggestion("");
      setRationale("");
      setConfidence(0);
      setSimilarTickets([]);
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }
  function overrideResolution() {
    setSuggestion("");
    setRationale("Suggestion overridden by user.");
    setConfidence(0);
    setSimilarTickets([]);
  }
  function clearResolution() {
    setSuggestion("");
    setRationale("");
    setConfidence(0);
    setSimilarTickets([]);
    setError(null);
  }
  return {
    suggestion,
    rationale,
    confidence,
    similarTickets,
    loading,
    error,
    fetchResolution,
    overrideResolution,
    clearResolution,
  };
}
