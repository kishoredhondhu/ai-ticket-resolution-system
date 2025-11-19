import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderHook, waitFor } from "@testing-library/react";

import { useUploadTicket } from "./useUploadTicket";

import * as ticketApi from "../api/ticketApi";

import { mockTicket } from "../test/mockData";

vi.mock("../api/ticketApi");

describe("useUploadTicket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useUploadTicket());

    expect(result.current.loading).toBe(false);

    expect(result.current.error).toBe("");

    expect(result.current.ticket).toBeNull();

    expect(typeof result.current.uploadTicket).toBe("function");
  });

  it("should upload ticket successfully", async () => {
    vi.mocked(ticketApi.uploadTicket).mockResolvedValueOnce(mockTicket);

    const { result } = renderHook(() => useUploadTicket());

    const file = new File(["content"], "test.pdf", { type: "application/pdf" });

    const uploadData = {
      file,

      description: "Test description",

      category: "Software",

      priority: "High",
    };

    await result.current.uploadTicket(uploadData);

    await waitFor(() => {
      expect(result.current.ticket).toEqual(mockTicket);
    });

    expect(result.current.loading).toBe(false);

    expect(result.current.error).toBe("");
  });

  it("should handle upload with null file", async () => {
    vi.mocked(ticketApi.uploadTicket).mockResolvedValueOnce(mockTicket);

    const { result } = renderHook(() => useUploadTicket());

    const uploadData = {
      file: null,

      description: "Test without file",
    };

    result.current.uploadTicket(uploadData);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(ticketApi.uploadTicket).toHaveBeenCalled();
  });

  it("should handle error during upload", async () => {
    const errorMessage = "Upload failed";

    vi.mocked(ticketApi.uploadTicket).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useUploadTicket());

    const file = new File(["content"], "test.txt", { type: "text/plain" });

    await result.current.uploadTicket({ file, description: "Test" });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });

    expect(result.current.ticket).toBeNull();

    expect(result.current.loading).toBe(false);
  });

  it("should handle non-Error exceptions", async () => {
    vi.mocked(ticketApi.uploadTicket).mockRejectedValueOnce("String error");

    const { result } = renderHook(() => useUploadTicket());

    const file = new File(["content"], "test.txt", { type: "text/plain" });

    await result.current.uploadTicket({ file, description: "Test" });

    await waitFor(() => {
      expect(result.current.error).toBe("Failed to upload ticket");
    });

    expect(result.current.loading).toBe(false);
  });

  it("should set loading to true during upload", async () => {
    let resolver: (value: any) => void;

    const promise = new Promise((resolve) => {
      resolver = resolve;
    });

    vi.mocked(ticketApi.uploadTicket).mockReturnValue(promise as any);

    const { result } = renderHook(() => useUploadTicket());

    const file = new File(["content"], "test.txt", { type: "text/plain" });

    const uploadPromise = result.current.uploadTicket({
      file,
      description: "Test",
    });

    // Check loading is true before promise resolves

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // Resolve the promise

    resolver!(mockTicket);

    await uploadPromise;
  });

  it("should clear error before new upload", async () => {
    vi.mocked(ticketApi.uploadTicket)

      .mockRejectedValueOnce(new Error("First error"))

      .mockResolvedValueOnce(mockTicket);

    const { result } = renderHook(() => useUploadTicket());

    const file = new File(["content"], "test.txt", { type: "text/plain" });

    // First upload fails

    result.current.uploadTicket({ file, description: "Test" });

    await waitFor(() => {
      expect(result.current.error).toBe("First error");
    });

    // Second upload succeeds

    result.current.uploadTicket({ file, description: "Test" });

    await waitFor(() => {
      expect(result.current.error).toBe("");

      expect(result.current.ticket).toEqual(mockTicket);
    });
  });

  it("should handle upload with all parameters", async () => {
    vi.mocked(ticketApi.uploadTicket).mockResolvedValueOnce(mockTicket);

    const { result } = renderHook(() => useUploadTicket());

    const file = new File(["content"], "test.pdf", { type: "application/pdf" });

    const uploadData = {
      file,

      description: "Complete test",

      category: "Hardware",

      priority: "Critical",
    };

    result.current.uploadTicket(uploadData);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const formDataCall = vi.mocked(ticketApi.uploadTicket).mock.calls[0][0];

    expect(formDataCall.get("file")).toBe(file);

    expect(formDataCall.get("description")).toBe("Complete test");

    expect(formDataCall.get("category")).toBe("Hardware");

    expect(formDataCall.get("priority")).toBe("Critical");
  });

  it("should handle upload without optional parameters", async () => {
    vi.mocked(ticketApi.uploadTicket).mockResolvedValueOnce(mockTicket);

    const { result } = renderHook(() => useUploadTicket());

    const file = new File(["content"], "test.txt", { type: "text/plain" });

    await result.current.uploadTicket({ file, description: "Minimal test" });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const formDataCall = vi.mocked(ticketApi.uploadTicket).mock.calls[0][0];

    expect(formDataCall.get("category")).toBeNull();

    expect(formDataCall.get("priority")).toBeNull();
  });
});
