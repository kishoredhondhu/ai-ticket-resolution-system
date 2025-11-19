import { describe, it, expect } from "vitest";

import i18n from "./i18n";

describe("i18n", () => {
  describe("i18n initialization", () => {
    it("should have use method", () => {
      expect(i18n.use).toBeDefined();

      expect(typeof i18n.use).toBe("function");
    });

    it("should have init method", () => {
      expect(i18n.init).toBeDefined();

      expect(typeof i18n.init).toBe("function");
    });

    it("should have t method for translations", () => {
      expect(i18n.t).toBeDefined();

      expect(typeof i18n.t).toBe("function");
    });

    it("should have changeLanguage method", () => {
      expect(i18n.changeLanguage).toBeDefined();

      expect(typeof i18n.changeLanguage).toBe("function");
    });
  });

  describe("translation function", () => {
    it("should return key as translation (mock implementation)", () => {
      const key = "submit_new_ticket";

      const result = i18n.t(key);

      expect(result).toBe(key);
    });

    it("should handle different keys", () => {
      expect(i18n.t("description")).toBe("description");

      expect(i18n.t("category")).toBe("category");

      expect(i18n.t("priority")).toBe("priority");
    });
  });

  describe("language change", () => {
    it("should return promise when changing language", async () => {
      const result = i18n.changeLanguage();

      expect(result).toBeInstanceOf(Promise);

      await expect(result).resolves.toBeUndefined();
    });
  });

  describe("initialization", () => {
    it("should return promise when initializing", async () => {
      const result = i18n.init();

      expect(result).toBeInstanceOf(Promise);

      await expect(result).resolves.toBeUndefined();
    });
  });
});
