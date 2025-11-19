import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import axios from "axios";

import { getResolutionSuggestion, checkRAGHealth } from "./resolutionApi";

import type { ResolutionResponse } from "./resolutionApi";

vi.mock("axios");

describe("resolutionApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getResolutionSuggestion", () => {
    it("should successfully get resolution suggestion", async () => {
      const mockResponse: ResolutionResponse = {
        suggested_resolution: "Reset password and clear cache",

        confidence: 0.95,

        similar_tickets: [
          {
            category: "Software",

            description: "Cannot login",

            resolution: "Password reset",

            similarity_score: 0.92,
          },
        ],

        method: "rag",

        metadata: {
          processing_time: 1.2,

          model_used: "gpt-4",
        },
      };

      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await getResolutionSuggestion(
        "Software",
        "High",
        "Cannot access email"
      );

      expect(result).toEqual(mockResponse);

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8000/api/suggest-resolution",

        {
          category: "Software",

          priority: "High",

          description: "Cannot access email",
        },

        {
          headers: {
            "Content-Type": "application/json",
          },

          timeout: 30000,
        }
      );
    });

    it("should handle axios error with detail message", async () => {
      const errorResponse = {
        response: {
          status: 500,

          data: {
            detail: "Service unavailable",
          },
        },
      };

      vi.mocked(axios.post).mockRejectedValueOnce(errorResponse);

      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(
        getResolutionSuggestion("Hardware", "Medium", "Screen broken")
      ).rejects.toThrow("Service unavailable");
    });

    it("should handle axios error with message field", async () => {
      const errorResponse = {
        response: {
          status: 400,

          data: {
            message: "Invalid request",
          },
        },
      };

      vi.mocked(axios.post).mockRejectedValueOnce(errorResponse);

      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(
        getResolutionSuggestion("Network", "Critical", "VPN not working")
      ).rejects.toThrow("Invalid request");
    });

    it("should handle axios error with error.message", async () => {
      const errorResponse = {
        message: "Network error",

        response: {
          status: 0,

          data: {},
        },
      };

      vi.mocked(axios.post).mockRejectedValueOnce(errorResponse);

      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(
        getResolutionSuggestion("Software", "Low", "Issue")
      ).rejects.toThrow("Network error");
    });

    it("should handle generic axios error", async () => {
      const errorResponse = {
        response: {
          status: 500,

          data: {},
        },
      };

      vi.mocked(axios.post).mockRejectedValueOnce(errorResponse);

      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(
        getResolutionSuggestion("Hardware", "High", "Problem")
      ).rejects.toThrow("Failed to get resolution suggestion");
    });

    it("should handle non-axios errors", async () => {
      const error = new Error("Unknown error");

      vi.mocked(axios.post).mockRejectedValueOnce(error);

      vi.mocked(axios.isAxiosError).mockReturnValueOnce(false);

      await expect(
        getResolutionSuggestion("Software", "Medium", "Issue")
      ).rejects.toThrow("Unknown error");
    });

    it("should handle timeout errors", async () => {
      const timeoutError = {
        code: "ECONNABORTED",

        message: "timeout of 30000ms exceeded",

        response: undefined,
      };

      vi.mocked(axios.post).mockRejectedValueOnce(timeoutError);

      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);

      await expect(
        getResolutionSuggestion("Network", "High", "Slow connection")
      ).rejects.toThrow("timeout of 30000ms exceeded");
    });

    it("should handle different priority levels", async () => {
      const mockResponse: ResolutionResponse = {
        suggested_resolution: "Test resolution",

        confidence: 0.8,

        similar_tickets: [],

        method: "rag",
      };

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

      const priorities = ["Low", "Medium", "High", "Critical"];

      for (const priority of priorities) {
        await getResolutionSuggestion("Software", priority, "Test");

        expect(axios.post).toHaveBeenCalledWith(
          expect.any(String),

          expect.objectContaining({ priority }),

          expect.any(Object)
        );
      }
    });

    it("should handle different categories", async () => {
      const mockResponse: ResolutionResponse = {
        suggested_resolution: "Test resolution",

        confidence: 0.8,

        similar_tickets: [],

        method: "rag",
      };

      vi.mocked(axios.post).mockResolvedValue({ data: mockResponse });

      const categories = ["Software", "Hardware", "Network", "Security"];

      for (const category of categories) {
        await getResolutionSuggestion(category, "Medium", "Test");

        expect(axios.post).toHaveBeenCalledWith(
          expect.any(String),

          expect.objectContaining({ category }),

          expect.any(Object)
        );
      }
    });
  });

  describe("checkRAGHealth", () => {
    it("should successfully check RAG health", async () => {
      const mockHealth = {
        status: "healthy",

        knowledge_base_size: 100,

        azure_connected: true,
      };

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockHealth });

      const result = await checkRAGHealth();

      expect(result).toEqual(mockHealth);

      expect(axios.get).toHaveBeenCalledWith("http://localhost:8000/health", {
        timeout: 5000,
      });
    });

    it("should handle health check failure", async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(
        new Error("Connection refused")
      );

      await expect(checkRAGHealth()).rejects.toThrow(
        "RAG service is not available"
      );
    });

    it("should handle timeout on health check", async () => {
      vi.mocked(axios.get).mockRejectedValueOnce({ code: "ECONNABORTED" });

      await expect(checkRAGHealth()).rejects.toThrow(
        "RAG service is not available"
      );
    });

    it("should use correct timeout", async () => {
      const mockHealth = {
        status: "healthy",

        knowledge_base_size: 50,

        azure_connected: false,
      };

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockHealth });

      await checkRAGHealth();

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),

        expect.objectContaining({ timeout: 5000 })
      );
    });

    it("should handle unhealthy service response", async () => {
      const mockHealth = {
        status: "unhealthy",

        knowledge_base_size: 0,

        azure_connected: false,
      };

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockHealth });

      const result = await checkRAGHealth();

      expect(result.status).toBe("unhealthy");

      expect(result.azure_connected).toBe(false);
    });
  });
});
