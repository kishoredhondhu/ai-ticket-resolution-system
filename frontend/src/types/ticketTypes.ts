export interface Ticket {
  ticketId: string;
  category: string;
  description: string;
  resolution: string;
  sop: string;
  priority: "High" | "Medium" | "Low" | "Critical";
  status: "Open" | "Resolved" | "Closed";
  createdDate: string;
  resolvedDate?: string;
}
