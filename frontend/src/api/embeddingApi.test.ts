import { describe, it, expect, vi, beforeEach } from "vitest";

import axios from "axios";

import { getEmbedding } from "./embeddingApi";

vi.mock("axios");

describe("embeddingApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEmbedding", () => {
    it("should get embedding for text", async () => {
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { embedding: mockEmbedding },
      });

      const result = await getEmbedding("Test text");

      expect(result).toEqual(mockEmbedding);

      expect(axios.post).toHaveBeenCalledWith("/api/embedding", {
        text: "Test text",
      });
    });

    it("should handle long text", async () => {
      const mockEmbedding = Array(1536).fill(0.1);

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { embedding: mockEmbedding },
      });

      const longText = "A".repeat(5000);

      const result = await getEmbedding(longText);

      expect(result).toEqual(mockEmbedding);

      expect(result.length).toBe(1536);
    });

    it("should handle empty text", async () => {
      const mockEmbedding: number[] = [];

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { embedding: mockEmbedding },
      });

      const result = await getEmbedding("");

      expect(result).toEqual(mockEmbedding);
    });

    it("should handle special characters in text", async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { embedding: mockEmbedding },
      });

      const specialText = "Hello! @#$% 123 🎉";

      await getEmbedding(specialText);

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),

        expect.objectContaining({ text: specialText })
      );
    });

    it("should handle multiline text", async () => {
      const mockEmbedding = [0.5, 0.6];

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { embedding: mockEmbedding },
      });

      const multilineText = "Line 1\nLine 2\nLine 3";

      const result = await getEmbedding(multilineText);

      expect(result).toEqual(mockEmbedding);
    });

    it("should handle network errors", async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(new Error("Network error"));

      await expect(getEmbedding("Test")).rejects.toThrow("Network error");
    });

    it("should handle API errors", async () => {
      const errorResponse = {
        response: { status: 500, data: { error: "Embedding service down" } },
      };

      vi.mocked(axios.post).mockRejectedValueOnce(errorResponse);

      await expect(getEmbedding("Test")).rejects.toEqual(errorResponse);
    });

    it("should handle timeout errors", async () => {
      vi.mocked(axios.post).mockRejectedValueOnce({
        code: "ECONNABORTED",

        message: "timeout",
      });

      await expect(getEmbedding("Test")).rejects.toMatchObject({
        code: "ECONNABORTED",
      });
    });

    it("should return array of numbers", async () => {
      const mockEmbedding = [1.5, 2.3, -0.5, 0, 3.14];

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { embedding: mockEmbedding },
      });

      const result = await getEmbedding("Test");

      expect(Array.isArray(result)).toBe(true);

      expect(result.every((val: number) => typeof val === "number")).toBe(true);
    });
  });
});
