import { useState } from "react";

import { submitFeedback } from "../api/feedbackApi";

export function useFeedback(ticketId: string) {
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  async function sendFeedback(feedback: string) {
    setLoading(true);

    try {
      const res = await submitFeedback(ticketId, feedback);

      setMessage(res.status);
    } finally {
      setLoading(false);
    }
  }

  return { sendFeedback, loading, message };
}
