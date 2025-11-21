import { useState } from "react";
import { uploadTicket } from "../api/ticketApi";
import type { Ticket } from "../types/ticketTypes";
export function useUploadTicket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  async function upload(data: {
    file: File | null;
    description: string;
    category?: string;
    priority?: string;
  }) {
    setLoading(true);
    setError("");
    setTicket(null);
    try {
      const formData = new FormData();
      if (data.file) formData.append("file", data.file);
      formData.append("description", data.description);
      if (data.category) formData.append("category", data.category);
      if (data.priority) formData.append("priority", data.priority);
      const result = await uploadTicket(formData);
      setTicket(result);
      setLoading(false);
    } catch (e: unknown) {
      const errorMsg =
        e instanceof Error ? e.message : "Failed to upload ticket";
      setError(errorMsg);
      setLoading(false);
    }
  }
  return { uploadTicket: upload, loading, error, ticket };
}
