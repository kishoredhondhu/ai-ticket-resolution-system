import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";
// Types matching the RAG service response
export interface SimilarTicket {
  ticket_id?: string;
  category: string;
  description: string;
  resolution: string;
  priority?: string;
  similarity_score: number;
}
export interface ResolutionResponse {
  suggested_resolution: string;
  confidence: number;
  similar_tickets: SimilarTicket[];
  method: string;
  metadata?: {
    processing_time?: number;
    model_used?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}
export interface TicketResolutionRequest {
  category: string;
  priority: string;
  description: string;
}
/**
 * Get resolution suggestion from RAG service
 * Uses the Python FastAPI backend with Hugging Face
 */
export async function getResolutionSuggestion(
  category: string,
  priority: string,
  description: string
): Promise<ResolutionResponse> {
  try {
    console.log(
      "%c🤖 RAG Resolution Request",
      "background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold"
    );
    console.log("Request:", { category, priority, description });
    const endpoint = `${API_CONFIG.RAG_SERVICE_URL}${API_CONFIG.ENDPOINTS.SUGGEST_RESOLUTION}`;
    const response = await axios.post<ResolutionResponse>(
      endpoint,
      {
        category,
        priority,
        description,
      } as TicketResolutionRequest,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: API_CONFIG.TIMEOUT,
      }
    );
    console.log(
      "%c✅ RAG Resolution Received",
      "background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold"
    );
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.log(
      "%c❌ RAG Resolution Failed",
      "background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold"
    );
    console.error("Error Details:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response Status:", error.response?.status);
      console.error("Response Data:", error.response?.data);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to get resolution suggestion";
      throw new Error(errorMessage);
    }
    throw error;
  }
}
/**
 * Check RAG service health
 */
export async function checkRAGHealth(): Promise<{
  status: string;
  knowledge_base_size: number;
  ai_available: boolean;
}> {
  try {
    const endpoint = `${API_CONFIG.RAG_SERVICE_URL}${API_CONFIG.ENDPOINTS.RAG_HEALTH}`;
    const response = await axios.get(endpoint, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error("RAG health check failed:", error);
    throw new Error("RAG service is not available");
  }
}
/**
 * Get RAG service statistics
 */
export async function getRAGStats(): Promise<{
  total_tickets: number;
  embedding_dimension: number;
  top_categories: string[];
  service_status: string;
}> {
  try {
    const endpoint = `${API_CONFIG.RAG_SERVICE_URL}${API_CONFIG.ENDPOINTS.RAG_STATS}`;
    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Failed to get RAG stats:", error);
    throw error;
  }
}
/**
 * Reload the knowledge base (admin function)
 */
export async function reloadKnowledgeBase(): Promise<{
  status: string;
  message: string;
  total_tickets: number;
}> {
  try {
    const endpoint = `${API_CONFIG.RAG_SERVICE_URL}${API_CONFIG.ENDPOINTS.RAG_RELOAD}`;
    const response = await axios.post(endpoint);
    return response.data;
  } catch (error) {
    console.error("Failed to reload knowledge base:", error);
    throw error;
  }
}
// Legacy function for backward compatibility
export async function getResolutionSuggestionByTicketId(
  ticketId: string
): Promise<{ suggestion: string; rationale: string }> {
  const response = await axios.get(`/api/resolution/${ticketId}`);
  return response.data;
}
