import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderHook, waitFor, act } from "@testing-library/react";

import { useResolutionSuggestion } from "./useResolutionSuggestion";

import * as resolutionApi from "../api/resolutionApi";

import { mockResolutionResponse } from "../test/mockData";

vi.mock("../api/resolutionApi");

describe("useResolutionSuggestion", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.resetAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useResolutionSuggestion());

    expect(result.current.suggestion).toBe("");

    expect(result.current.rationale).toBe("");

    expect(result.current.confidence).toBe(0);

    expect(result.current.similarTickets).toEqual([]);

    expect(result.current.loading).toBe(false);

    expect(result.current.error).toBeNull();

    expect(typeof result.current.fetchResolution).toBe("function");

    expect(typeof result.current.overrideResolution).toBe("function");

    expect(typeof result.current.clearResolution).toBe("function");
  });

  it("should fetch resolution successfully", async () => {
    vi.mocked(resolutionApi.getResolutionSuggestion).mockResolvedValueOnce(
      mockResolutionResponse
    );

    const { result } = renderHook(() => useResolutionSuggestion());

    await act(async () => {
      await result.current.fetchResolution(
        "Software",
        "High",
        "Cannot access email"
      );
    });

    expect(result.current.suggestion).toBe(
      mockResolutionResponse.suggested_resolution
    );

    expect(result.current.confidence).toBe(mockResolutionResponse.confidence);

    expect(result.current.similarTickets).toEqual(
      mockResolutionResponse.similar_tickets
    );

    expect(result.current.rationale).toContain("RAG method");

    expect(result.current.rationale).toContain("95.0% confidence");

    expect(result.current.loading).toBe(false);

    expect(result.current.error).toBeNull();
  });

  it("should set loading to true during fetch", async () => {
    vi.mocked(resolutionApi.getResolutionSuggestion).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockResolutionResponse), 100)
        )
    );

    const { result } = renderHook(() => useResolutionSuggestion());

    act(() => {
      result.current.fetchResolution("Software", "High", "Test");
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should handle fetch errors", async () => {
    const errorMessage = "Service unavailable";

    vi.mocked(resolutionApi.getResolutionSuggestion).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useResolutionSuggestion());

    await expect(async () => {
      await act(async () => {
        await result.current.fetchResolution("Hardware", "Medium", "Issue");
      });
    }).rejects.toThrow(errorMessage);
  });

  it("should handle non-Error exceptions", async () => {
    vi.mocked(resolutionApi.getResolutionSuggestion).mockRejectedValueOnce(
      "String error"
    );

    const { result } = renderHook(() => useResolutionSuggestion());

    await expect(async () => {
      await act(async () => {
        await result.current.fetchResolution("Network", "Low", "Test");
      });
    }).rejects.toBe("String error");
  });

  it("should generate rationale with similar tickets count", async () => {
    const responseWith3Tickets = {
      ...mockResolutionResponse,

      similar_tickets: [
        mockResolutionResponse.similar_tickets[0],

        mockResolutionResponse.similar_tickets[0],

        mockResolutionResponse.similar_tickets[0],
      ],
    };

    vi.mocked(resolutionApi.getResolutionSuggestion).mockResolvedValueOnce(
      responseWith3Tickets
    );

    const { result } = renderHook(() => useResolutionSuggestion());

    await act(async () => {
      await result.current.fetchResolution("Software", "High", "Test");
    });

    expect(result.current.rationale).toContain("Found 3 similar ticket(s)");
  });

  it("should override resolution", () => {
    const { result } = renderHook(() => useResolutionSuggestion());

    act(() => {
      result.current.overrideResolution();
    });

    expect(result.current.suggestion).toBe("");

    expect(result.current.rationale).toBe("Suggestion overridden by user.");

    expect(result.current.confidence).toBe(0);

    expect(result.current.similarTickets).toEqual([]);
  });

  it("should clear resolution", () => {
    const { result } = renderHook(() => useResolutionSuggestion());

    act(() => {
      result.current.clearResolution();
    });

    expect(result.current.suggestion).toBe("");

    expect(result.current.rationale).toBe("");

    expect(result.current.confidence).toBe(0);

    expect(result.current.similarTickets).toEqual([]);

    expect(result.current.error).toBeNull();
  });

  it("should clear error state on successful fetch after error", async () => {
    vi.mocked(resolutionApi.getResolutionSuggestion)

      .mockRejectedValueOnce(new Error("First error"))

      .mockResolvedValueOnce(mockResolutionResponse);

    const { result } = renderHook(() => useResolutionSuggestion());

    // First fetch fails - just verify it throws

    await expect(async () => {
      await act(async () => {
        await result.current.fetchResolution("Software", "High", "Test");
      });
    }).rejects.toThrow("First error");

    // Second fetch succeeds

    await act(async () => {
      await result.current.fetchResolution("Software", "High", "Test");
    });

    // Verify successful fetch cleared error and set data

    expect(result.current.error).toBeNull();

    expect(result.current.suggestion).toBe(
      mockResolutionResponse.suggested_resolution
    );

    expect(result.current.loading).toBe(false);
  });

  it("should handle resolution with no similar tickets", async () => {
    const responseNoTickets = {
      suggested_resolution: mockResolutionResponse.suggested_resolution,

      confidence: mockResolutionResponse.confidence,

      similar_tickets: [],

      method: mockResolutionResponse.method,

      metadata: mockResolutionResponse.metadata,
    };

    vi.mocked(resolutionApi.getResolutionSuggestion).mockResolvedValueOnce(
      responseNoTickets
    );

    const { result } = renderHook(() => useResolutionSuggestion());

    await act(async () => {
      await result.current.fetchResolution("Software", "High", "Test");
    });

    expect(result.current.similarTickets).toEqual([]);

    expect(result.current.rationale).toContain("Found 0 similar ticket(s)");

    expect(result.current.confidence).toBe(0.95);
  });

  it("should format confidence percentage correctly", async () => {
    const responseWithLowConfidence = {
      suggested_resolution: mockResolutionResponse.suggested_resolution,

      confidence: 0.7534,

      similar_tickets: [],

      method: mockResolutionResponse.method,

      metadata: mockResolutionResponse.metadata,
    };

    vi.mocked(resolutionApi.getResolutionSuggestion).mockResolvedValueOnce(
      responseWithLowConfidence
    );

    const { result } = renderHook(() => useResolutionSuggestion());

    await act(async () => {
      await result.current.fetchResolution("Software", "High", "Test");
    });

    expect(result.current.rationale).toContain("75.3% confidence");

    expect(result.current.confidence).toBe(0.7534);
  });

  it("should return response from fetchResolution", async () => {
    const customResponse = {
      suggested_resolution: mockResolutionResponse.suggested_resolution,

      confidence: 0.7534,

      similar_tickets: [],

      method: mockResolutionResponse.method,

      metadata: mockResolutionResponse.metadata,
    };

    vi.mocked(resolutionApi.getResolutionSuggestion).mockResolvedValueOnce(
      customResponse
    );

    const { result } = renderHook(() => useResolutionSuggestion());

    const response = await act(async () => {
      return await result.current.fetchResolution("Software", "High", "Test");
    });

    expect(response).toEqual(customResponse);
  });

  it("should handle different method types in rationale", async () => {
    const tfidfResponse = {
      suggested_resolution: mockResolutionResponse.suggested_resolution,

      confidence: 0.7534,

      similar_tickets: mockResolutionResponse.similar_tickets,

      method: "tfidf" as const,

      metadata: mockResolutionResponse.metadata,
    };

    vi.mocked(resolutionApi.getResolutionSuggestion).mockResolvedValueOnce(
      tfidfResponse
    );

    const { result } = renderHook(() => useResolutionSuggestion());

    await act(async () => {
      await result.current.fetchResolution("Software", "High", "Test");
    });

    expect(result.current.rationale).toContain("TFIDF method");

    expect(result.current.confidence).toBe(0.7534);
  });
});
