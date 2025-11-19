/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from "vitest";

import {
  getFileExtension,
  isValidFileType,
  readFileAsText,
  readFileAsDataURL,
} from "./fileUtils";

describe("fileUtils", () => {
  describe("getFileExtension", () => {
    it("should extract file extension from file name", () => {
      const file = new File([""], "test.txt", { type: "text/plain" });

      expect(getFileExtension(file)).toBe("txt");
    });

    it("should extract extension from file with multiple dots", () => {
      const file = new File([""], "my.file.name.pdf", {
        type: "application/pdf",
      });

      expect(getFileExtension(file)).toBe("pdf");
    });

    it("should return lowercase extension", () => {
      const file = new File([""], "document.PDF", { type: "application/pdf" });

      expect(getFileExtension(file)).toBe("pdf");
    });

    it("should return empty string for file without extension", () => {
      const file = new File([""], "noextension", { type: "text/plain" });

      expect(getFileExtension(file)).toBe("");
    });

    it("should handle empty filename", () => {
      const file = new File([""], "", { type: "text/plain" });

      expect(getFileExtension(file)).toBe("");
    });
  });

  describe("isValidFileType", () => {
    it("should return true for pdf files", () => {
      const file = new File([""], "document.pdf", { type: "application/pdf" });

      expect(isValidFileType(file)).toBe(true);
    });

    it("should return true for png files", () => {
      const file = new File([""], "image.png", { type: "image/png" });

      expect(isValidFileType(file)).toBe(true);
    });

    it("should return true for jpg files", () => {
      const file = new File([""], "photo.jpg", { type: "image/jpeg" });

      expect(isValidFileType(file)).toBe(true);
    });

    it("should return true for jpeg files", () => {
      const file = new File([""], "photo.jpeg", { type: "image/jpeg" });

      expect(isValidFileType(file)).toBe(true);
    });

    it("should return true for txt files", () => {
      const file = new File([""], "notes.txt", { type: "text/plain" });

      expect(isValidFileType(file)).toBe(true);
    });

    it("should return false for invalid file types", () => {
      const file = new File([""], "script.exe", {
        type: "application/x-msdownload",
      });

      expect(isValidFileType(file)).toBe(false);
    });

    it("should return false for zip files", () => {
      const file = new File([""], "archive.zip", { type: "application/zip" });

      expect(isValidFileType(file)).toBe(false);
    });

    it("should be case insensitive", () => {
      const file = new File([""], "image.PNG", { type: "image/png" });

      expect(isValidFileType(file)).toBe(true);
    });
  });

  describe("readFileAsText", () => {
    it("should read file content as text", async () => {
      const content = "Hello, World!";

      const file = new File([content], "test.txt", { type: "text/plain" });

      const result = await readFileAsText(file);

      expect(result).toBe(content);
    });

    it("should handle empty file", async () => {
      const file = new File([""], "empty.txt", { type: "text/plain" });

      const result = await readFileAsText(file);

      expect(result).toBe("");
    });

    it("should handle multiline text", async () => {
      const content = "Line 1\nLine 2\nLine 3";

      const file = new File([content], "multiline.txt", { type: "text/plain" });

      const result = await readFileAsText(file);

      expect(result).toBe(content);
    });

    it("should handle special characters", async () => {
      const content = "Special: @#$%^&*()";

      const file = new File([content], "special.txt", { type: "text/plain" });

      const result = await readFileAsText(file);

      expect(result).toBe(content);
    });
  });

  describe("readFileAsDataURL", () => {
    it("should read file as data URL", async () => {
      const content = "test content";

      const file = new File([content], "test.txt", { type: "text/plain" });

      const result = await readFileAsDataURL(file);

      expect(result).toContain("data:");

      expect(result).toContain("base64");
    });

    it("should handle image files", async () => {
      const file = new File(["image data"], "image.png", { type: "image/png" });

      const result = await readFileAsDataURL(file);

      expect(result).toContain("data:");
    });

    it("should handle empty file", async () => {
      const file = new File([""], "empty.txt", { type: "text/plain" });

      const result = await readFileAsDataURL(file);

      expect(result).toContain("data:");
    });
  });
});
