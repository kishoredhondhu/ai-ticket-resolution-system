import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderHook, waitFor, act } from "@testing-library/react";

import { useFeedback } from "./useFeedback";

import * as feedbackApi from "../api/feedbackApi";

vi.mock("../api/feedbackApi");

describe("useFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useFeedback("T123"));

    expect(result.current.loading).toBe(false);

    expect(result.current.message).toBe("");

    expect(typeof result.current.sendFeedback).toBe("function");
  });

  it("should send feedback successfully", async () => {
    vi.mocked(feedbackApi.submitFeedback).mockResolvedValueOnce({
      status: "success",
    });

    const { result } = renderHook(() => useFeedback("T123"));

    await act(async () => {
      await result.current.sendFeedback("Great resolution!");
    });

    expect(result.current.message).toBe("success");

    expect(result.current.loading).toBe(false);

    expect(feedbackApi.submitFeedback).toHaveBeenCalledWith(
      "T123",
      "Great resolution!"
    );
  });

  it("should set loading to true during feedback submission", async () => {
    vi.mocked(feedbackApi.submitFeedback).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ status: "success" }), 100)
        )
    );

    const { result } = renderHook(() => useFeedback("T456"));

    act(() => {
      result.current.sendFeedback("Feedback text");
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should handle different status messages", async () => {
    const statuses = ["success", "pending", "received", "processed"];

    for (const status of statuses) {
      vi.mocked(feedbackApi.submitFeedback).mockResolvedValueOnce({ status });

      const { result } = renderHook(() => useFeedback("T789"));

      await act(async () => {
        await result.current.sendFeedback("Test feedback");
      });

      expect(result.current.message).toBe(status);
    }
  });

  it("should handle empty feedback", async () => {
    vi.mocked(feedbackApi.submitFeedback).mockResolvedValueOnce({
      status: "success",
    });

    const { result } = renderHook(() => useFeedback("T111"));

    await act(async () => {
      await result.current.sendFeedback("");
    });

    expect(feedbackApi.submitFeedback).toHaveBeenCalledWith("T111", "");

    expect(result.current.message).toBe("success");
  });

  it("should handle long feedback text", async () => {
    vi.mocked(feedbackApi.submitFeedback).mockResolvedValueOnce({
      status: "success",
    });

    const { result } = renderHook(() => useFeedback("T222"));

    const longFeedback = "A".repeat(5000);

    await act(async () => {
      await result.current.sendFeedback(longFeedback);
    });

    expect(feedbackApi.submitFeedback).toHaveBeenCalledWith(
      "T222",
      longFeedback
    );
  });

  it("should handle feedback with special characters", async () => {
    vi.mocked(feedbackApi.submitFeedback).mockResolvedValueOnce({
      status: "success",
    });

    const { result } = renderHook(() => useFeedback("T333"));

    const specialFeedback =
      'Great! 👍 Works @100% <script>alert("test")</script>';

    await act(async () => {
      await result.current.sendFeedback(specialFeedback);
    });

    expect(feedbackApi.submitFeedback).toHaveBeenCalledWith(
      "T333",
      specialFeedback
    );

    expect(result.current.message).toBe("success");
  });

  it("should set loading to false even on error", async () => {
    vi.mocked(feedbackApi.submitFeedback).mockRejectedValueOnce(
      new Error("API Error")
    );

    const { result } = renderHook(() => useFeedback("T444"));

    await expect(
      act(async () => {
        await result.current.sendFeedback("Feedback");
      })
    ).rejects.toThrow("API Error");

    expect(result.current.loading).toBe(false);
  });

  it("should use correct ticketId for each instance", async () => {
    vi.mocked(feedbackApi.submitFeedback).mockResolvedValue({
      status: "success",
    });

    const ticketIds = ["T111", "T222", "T333"];

    for (const ticketId of ticketIds) {
      const { result } = renderHook(() => useFeedback(ticketId));

      await act(async () => {
        await result.current.sendFeedback("Test");
      });

      expect(feedbackApi.submitFeedback).toHaveBeenCalledWith(ticketId, "Test");
    }
  });

  it("should handle multiple feedback submissions", async () => {
    vi.mocked(feedbackApi.submitFeedback)

      .mockResolvedValueOnce({ status: "first" })

      .mockResolvedValueOnce({ status: "second" });

    const { result } = renderHook(() => useFeedback("T555"));

    await act(async () => {
      await result.current.sendFeedback("First feedback");
    });

    expect(result.current.message).toBe("first");

    await act(async () => {
      await result.current.sendFeedback("Second feedback");
    });

    expect(result.current.message).toBe("second");
  });

  it("should clear previous message when sending new feedback", async () => {
    vi.mocked(feedbackApi.submitFeedback)

      .mockResolvedValueOnce({ status: "old" })

      .mockResolvedValueOnce({ status: "new" });

    const { result } = renderHook(() => useFeedback("T666"));

    await act(async () => {
      await result.current.sendFeedback("First");
    });

    await act(async () => {
      await result.current.sendFeedback("Second");
    });

    expect(result.current.message).toBe("new");
  });

  it("should handle network errors", async () => {
    vi.mocked(feedbackApi.submitFeedback).mockRejectedValueOnce(
      new Error("Network error")
    );

    const { result } = renderHook(() => useFeedback("T777"));

    await expect(
      act(async () => {
        await result.current.sendFeedback("Feedback");
      })
    ).rejects.toThrow("Network error");

    expect(result.current.loading).toBe(false);
  });
});
