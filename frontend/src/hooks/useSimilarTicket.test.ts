/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderHook, waitFor } from "@testing-library/react";

import { useSimilarTickets } from "./useSimilarTickets";

import * as ticketApi from "../api/ticketApi";

import { mockTickets } from "../test/mockData";

vi.mock("../api/ticketApi");

describe("useSimilarTickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    vi.mocked(ticketApi.getAllTickets).mockResolvedValue([]);

    const { result } = renderHook(() => useSimilarTickets());

    expect(result.current.loading).toBe(true);

    expect(result.current.error).toBeNull();
  });

  it("should fetch all tickets on mount", async () => {
    vi.mocked(ticketApi.getAllTickets).mockResolvedValueOnce(mockTickets);

    const { result } = renderHook(() => useSimilarTickets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tickets).toEqual(mockTickets);

    expect(result.current.error).toBeNull();

    expect(ticketApi.getAllTickets).toHaveBeenCalledTimes(1);
  });

  it("should filter tickets by status", async () => {
    vi.mocked(ticketApi.getAllTickets).mockResolvedValueOnce(mockTickets);

    const { result } = renderHook(() =>
      useSimilarTickets({ statusFilter: "Resolved" })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const resolvedTickets = result.current.tickets.filter(
      (t: any) => t.status === "Resolved"
    );

    expect(result.current.tickets).toEqual(resolvedTickets);

    expect(result.current.tickets.length).toBeGreaterThan(0);
  });

  it("should skip fetching when disabled", async () => {
    const { result } = renderHook(() => useSimilarTickets({ enabled: false }));

    expect(result.current.loading).toBe(false);

    expect(result.current.tickets).toEqual([]);

    expect(ticketApi.getAllTickets).not.toHaveBeenCalled();
  });

  it("should handle empty response", async () => {
    vi.mocked(ticketApi.getAllTickets).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSimilarTickets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tickets).toEqual([]);

    expect(result.current.error).toBeNull();
  });

  it("should handle API errors", async () => {
    const error = new Error("API Error");

    vi.mocked(ticketApi.getAllTickets).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useSimilarTickets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tickets).toEqual([]);

    expect(result.current.error).toEqual(error);
  });

  it("should handle non-array responses", async () => {
    vi.mocked(ticketApi.getAllTickets).mockResolvedValueOnce(
      null as unknown as any[]
    );

    const { result } = renderHook(() => useSimilarTickets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tickets).toEqual([]);
  });

  it("should refetch when statusFilter changes", async () => {
    vi.mocked(ticketApi.getAllTickets).mockResolvedValue(mockTickets);

    const { result, rerender } = renderHook(
      ({ statusFilter }) => useSimilarTickets({ statusFilter }),

      { initialProps: { statusFilter: "Open" } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const openTickets = result.current.tickets;

    rerender({ statusFilter: "Resolved" });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tickets).not.toEqual(openTickets);

    expect(ticketApi.getAllTickets).toHaveBeenCalledTimes(2);
  });

  it("should refetch when enabled changes from false to true", async () => {
    vi.mocked(ticketApi.getAllTickets).mockResolvedValue(mockTickets);

    const { result, rerender } = renderHook(
      ({ enabled }) => useSimilarTickets({ enabled }),

      { initialProps: { enabled: false } }
    );

    expect(ticketApi.getAllTickets).not.toHaveBeenCalled();

    rerender({ enabled: true });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(ticketApi.getAllTickets).toHaveBeenCalledTimes(1);

    expect(result.current.tickets.length).toBeGreaterThan(0);
  });

  it("should filter correctly with Open status", async () => {
    vi.mocked(ticketApi.getAllTickets).mockResolvedValueOnce(mockTickets);

    const { result } = renderHook(() =>
      useSimilarTickets({ statusFilter: "Open" })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tickets.every((t: any) => t.status === "Open")).toBe(
      true
    );
  });

  it("should return empty array when no tickets match filter", async () => {
    vi.mocked(ticketApi.getAllTickets).mockResolvedValueOnce(mockTickets);

    const { result } = renderHook(() =>
      useSimilarTickets({ statusFilter: "Closed" })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tickets).toEqual([]);
  });
});
