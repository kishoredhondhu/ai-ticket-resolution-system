import type { Ticket } from "../types/ticketTypes";
import type { SimilarTicket, ResolutionResponse } from "../api/resolutionApi";
export const mockTicket: Ticket = {
  ticketId: "T1234567890",
  category: "Software",
  description: "Unable to access email account",
  resolution: "Reset password and clear cache",
  sop: "SOP-001: Email Access Issues",
  priority: "High",
  status: "Open",
  createdDate: "2025-11-13T10:00:00.000Z",
};
export const mockResolvedTicket: Ticket = {
  ...mockTicket,
  status: "Resolved",
  resolvedDate: "2025-11-13T12:00:00.000Z",
};
export const mockSimilarTicket: SimilarTicket = {
  ticket_id: "T9876543210",
  category: "Software",
  description: "Cannot log into email",
  resolution: "Password reset required",
  priority: "Medium",
  similarity_score: 0.92,
};
export const mockResolutionResponse: ResolutionResponse = {
  suggested_resolution: "Reset the user password and clear browser cache",
  confidence: 0.95,
  similar_tickets: [mockSimilarTicket],
  method: "rag",
  metadata: {
    processing_time: 1.2,
    model_used: "gpt-4",
  },
};
export const mockFile = new File(["test content"], "test.txt", {
  type: "text/plain",
});
export const mockPdfFile = new File(["pdf content"], "document.pdf", {
  type: "application/pdf",
});
export const mockImageFile = new File(["image content"], "image.png", {
  type: "image/png",
});
export const mockTickets: Ticket[] = [
  mockTicket,
  {
    ticketId: "T1234567891",
    category: "Hardware",
    description: "Laptop screen flickering",
    resolution: "Replace display cable",
    sop: "SOP-002: Display Issues",
    priority: "Medium",
    status: "Open",
    createdDate: "2025-11-12T09:00:00.000Z",
  },
  {
    ticketId: "T1234567892",
    category: "Network",
    description: "Cannot connect to VPN",
    resolution: "Update VPN client",
    sop: "SOP-003: VPN Issues",
    priority: "Critical",
    status: "Resolved",
    createdDate: "2025-11-11T14:30:00.000Z",
    resolvedDate: "2025-11-11T15:00:00.000Z",
  },
];
