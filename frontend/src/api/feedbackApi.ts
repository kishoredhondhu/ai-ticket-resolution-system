import axios from "axios";

export async function submitFeedback(
  ticketId: string,
  feedback: string
): Promise<{ status: string }> {
  const response = await axios.post(`/api/feedback/${ticketId}`, { feedback });

  return response.data;
}
