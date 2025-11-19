import { describe, it, expect, vi, beforeEach } from "vitest";

import { uploadTicket, getTicket, getAllTickets } from "./ticketApi";

// Mock console methods

vi.mock("console", () => ({
  log: vi.fn(),

  error: vi.fn(),
}));

describe("ticketApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadTicket", () => {
    it("should upload ticket with file and description", async () => {
      const formData = new FormData();

      const file = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      formData.append("file", file);

      formData.append("description", "Test description");

      formData.append("category", "Software");

      const result = await uploadTicket(formData);

      expect(result).toBeDefined();

      expect(result.ticketId).toBeDefined();

      expect(result.ticketId).toMatch(/^T\d+$/);

      expect(result.category).toBe("Software");

      expect(result.description).toBe("Test description");

      expect(result.status).toBe("Open");

      expect(result.priority).toBe("Medium");
    });

    it("should throw error if no file provided", async () => {
      const formData = new FormData();

      formData.append("description", "Test description");

      await expect(uploadTicket(formData)).rejects.toThrow("No file provided");
    });

    it("should use default category if not provided", async () => {
      const formData = new FormData();

      const file = new File(["content"], "test.txt", { type: "text/plain" });

      formData.append("file", file);

      formData.append("description", "Test");

      const result = await uploadTicket(formData);

      expect(result.category).toBe("General");
    });

    it("should use default description if not provided", async () => {
      const formData = new FormData();

      const file = new File(["content"], "test.txt", { type: "text/plain" });

      formData.append("file", file);

      formData.append("category", "Hardware");

      const result = await uploadTicket(formData);

      expect(result.description).toBe("No description provided");
    });

    it("should set createdDate to current date", async () => {
      const formData = new FormData();

      const file = new File(["content"], "test.txt", { type: "text/plain" });

      formData.append("file", file);

      formData.append("description", "Test");

      const beforeTime = new Date().getTime();

      const result = await uploadTicket(formData);

      const afterTime = new Date().getTime();

      const ticketTime = new Date(result.createdDate).getTime();

      expect(ticketTime).toBeGreaterThanOrEqual(beforeTime - 1000);

      expect(ticketTime).toBeLessThanOrEqual(afterTime + 1000);
    });

    it("should initialize with empty resolution and sop", async () => {
      const formData = new FormData();

      const file = new File(["content"], "test.txt", { type: "text/plain" });

      formData.append("file", file);

      formData.append("description", "Test");

      const result = await uploadTicket(formData);

      expect(result.resolution).toBe("");

      expect(result.sop).toBe("");
    });

    it("should handle different file types", async () => {
      const fileTypes = [
        { name: "doc.pdf", type: "application/pdf" },

        { name: "img.png", type: "image/png" },

        { name: "note.txt", type: "text/plain" },
      ];

      for (const fileType of fileTypes) {
        const formData = new FormData();

        const file = new File(["content"], fileType.name, {
          type: fileType.type,
        });

        formData.append("file", file);

        formData.append("description", "Test");

        const result = await uploadTicket(formData);

        expect(result).toBeDefined();

        expect(result.ticketId).toBeDefined();
      }
    });

    it("should simulate processing delay", async () => {
      const formData = new FormData();

      const file = new File(["content"], "test.txt", { type: "text/plain" });

      formData.append("file", file);

      formData.append("description", "Test");

      const startTime = Date.now();

      await uploadTicket(formData);

      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
    });
  });

  describe("getTicket", () => {
    it("should return ticket by id", async () => {
      const ticketId = "T123456";

      const result = await getTicket(ticketId);

      expect(result).toBeDefined();

      expect(result.ticketId).toBe(ticketId);

      expect(result.category).toBe("General");

      expect(result.status).toBe("Open");
    });

    it("should return ticket with default values", async () => {
      const result = await getTicket("T999");

      expect(result.description).toBe("Mock ticket");

      expect(result.priority).toBe("Medium");

      expect(result.resolution).toBe("");

      expect(result.sop).toBe("");
    });

    it("should set current date as createdDate", async () => {
      const result = await getTicket("T123");

      const ticketDate = new Date(result.createdDate);

      const now = new Date();

      expect(ticketDate.getDate()).toBe(now.getDate());

      expect(ticketDate.getMonth()).toBe(now.getMonth());

      expect(ticketDate.getFullYear()).toBe(now.getFullYear());
    });
  });

  describe("getAllTickets", () => {
    it("should return empty array", async () => {
      const result = await getAllTickets();

      expect(result).toBeDefined();

      expect(Array.isArray(result)).toBe(true);

      expect(result.length).toBe(0);
    });

    it("should return array type", async () => {
      const result = await getAllTickets();

      expect(result).toBeInstanceOf(Array);
    });
  });
});
