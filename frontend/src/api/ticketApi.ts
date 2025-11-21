import { type Ticket } from "../types/ticketTypes";

export async function uploadTicket(data: FormData): Promise<Ticket> {
  const description = data.get("description") as string;

  const category = data.get("category") as string;

  // Process ticket locally - no backend needed

  console.log(
    "%c📤 Processing Ticket",
    "background: #6366f1; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold"
  );

  console.log("Category:", category);

  console.log("Description:", description);

  // Simulate processing delay

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Create mock ticket response

  const mockTicket: Ticket = {
    ticketId: `T${Date.now()}`,

    category: category || "General",

    description: description || "No description provided",

    resolution: "",

    sop: "",

    priority: "Medium",

    status: "Open",

    createdDate: new Date().toISOString(),
  };

  console.log(
    "%c✅ Ticket Created",
    "background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold"
  );

  console.log("Ticket:", mockTicket);

  return mockTicket;
}

export async function getTicket(id: string): Promise<Ticket> {
  // Mock implementation - no backend needed

  return {
    ticketId: id,

    category: "General",

    description: "Mock ticket",

    resolution: "",

    sop: "",

    priority: "Medium",

    status: "Open",

    createdDate: new Date().toISOString(),
  };
}

export async function getAllTickets(): Promise<Ticket[]> {
  // Return empty array - no backend needed

  return [];
}
