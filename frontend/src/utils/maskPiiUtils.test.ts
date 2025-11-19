import { describe, it, expect } from "vitest";

import {
  maskEmails,
  maskPhones,
  maskUserIds,
  maskAllPII,
} from "./maskPiiUtils";

describe("maskPiiUtils", () => {
  describe("maskEmails", () => {
    it("should mask simple email addresses", () => {
      const text = "Contact us at support@example.com";

      const result = maskEmails(text);

      expect(result).toBe("Contact us at [MASKED_EMAIL]");
    });

    it("should mask multiple email addresses", () => {
      const text = "Email john@company.com or jane@business.org";

      const result = maskEmails(text);

      expect(result).toBe("Email [MASKED_EMAIL] or [MASKED_EMAIL]");
    });

    it("should mask emails with numbers", () => {
      const text = "User user123@test456.com reported issue";

      const result = maskEmails(text);

      expect(result).toBe("User [MASKED_EMAIL] reported issue");
    });

    it("should mask emails with special characters", () => {
      const text = "Contact first.last+tag@example.co.uk";

      const result = maskEmails(text);

      expect(result).toBe("Contact [MASKED_EMAIL]");
    });

    it("should not mask text without emails", () => {
      const text = "No email here just text";

      const result = maskEmails(text);

      expect(result).toBe("No email here just text");
    });

    it("should handle empty string", () => {
      expect(maskEmails("")).toBe("");
    });

    it("should mask email at start of string", () => {
      const text = "admin@site.com is the admin email";

      const result = maskEmails(text);

      expect(result).toBe("[MASKED_EMAIL] is the admin email");
    });

    it("should mask email at end of string", () => {
      const text = "Send report to report@company.com";

      const result = maskEmails(text);

      expect(result).toBe("Send report to [MASKED_EMAIL]");
    });
  });

  describe("maskPhones", () => {
    it("should mask US phone numbers with dashes", () => {
      const text = "Call 555-123-4567 for support";

      const result = maskPhones(text);

      expect(result).toBe("Call [MASKED_PHONE] for support");
    });

    it("should mask phone numbers with dots", () => {
      const text = "Phone: 555.123.4567";

      const result = maskPhones(text);

      expect(result).toBe("Phone: [MASKED_PHONE]");
    });

    it("should mask phone numbers with spaces", () => {
      const text = "Contact 555 123 4567";

      const result = maskPhones(text);

      expect(result).toBe("Contact [MASKED_PHONE]");
    });

    it("should mask phone numbers with country code", () => {
      const text = "International: +1-555-123-4567";

      const result = maskPhones(text);

      expect(result).toBe("International: [MASKED_PHONE]");
    });

    it("should mask multiple phone numbers", () => {
      const text = "Office: 555-111-2222, Mobile: 555-333-4444";

      const result = maskPhones(text);

      expect(result).toBe("Office: [MASKED_PHONE], Mobile: [MASKED_PHONE]");
    });

    it("should mask phone without separators (10 digits)", () => {
      const text = "Call 5551234567";

      const result = maskPhones(text);

      expect(result).toBe("Call [MASKED_PHONE]");
    });

    it("should not mask numbers that are not phone numbers", () => {
      const text = "Order #12345";

      const result = maskPhones(text);

      expect(result).toBe("Order #12345");
    });

    it("should handle empty string", () => {
      expect(maskPhones("")).toBe("");
    });
  });

  describe("maskUserIds", () => {
    it("should mask user IDs with pattern AA123456", () => {
      const text = "User AB123456 logged in";

      const result = maskUserIds(text);

      expect(result).toBe("User [MASKED_ID] logged in");
    });

    it("should mask various ID patterns", () => {
      const text = "Users: EMP1234, USR567890, ID12345";

      const result = maskUserIds(text);

      expect(result).toBe("Users: [MASKED_ID], [MASKED_ID], [MASKED_ID]");
    });

    it("should mask IDs with longer letter prefix", () => {
      const text = "Employee EMPLOYEE123456 submitted ticket";

      const result = maskUserIds(text);

      expect(result).toBe("Employee [MASKED_ID] submitted ticket");
    });

    it("should not mask words without numbers", () => {
      const text = "USERNAME without numbers";

      const result = maskUserIds(text);

      expect(result).toBe("USERNAME without numbers");
    });

    it("should not mask numbers without letters", () => {
      const text = "Ticket 123456 opened";

      const result = maskUserIds(text);

      expect(result).toBe("Ticket 123456 opened");
    });

    it("should respect word boundaries", () => {
      const text = "ID:AB123456:end";

      const result = maskUserIds(text);

      expect(result).toBe("ID:[MASKED_ID]:end");
    });

    it("should handle empty string", () => {
      expect(maskUserIds("")).toBe("");
    });
  });

  describe("maskAllPII", () => {
    it("should mask emails, phones, and user IDs together", () => {
      const text =
        "Contact user@example.com or call 555-123-4567. User ID: EMP12345";

      const result = maskAllPII(text);

      expect(result).toBe(
        "Contact [MASKED_EMAIL] or call [MASKED_PHONE]. User ID: [MASKED_ID]"
      );
    });

    it("should handle text with only emails", () => {
      const text = "Send to admin@company.com";

      const result = maskAllPII(text);

      expect(result).toBe("Send to [MASKED_EMAIL]");
    });

    it("should handle text with only phones", () => {
      const text = "Call 555-999-8888";

      const result = maskAllPII(text);

      expect(result).toBe("Call [MASKED_PHONE]");
    });

    it("should handle text with only user IDs", () => {
      const text = "User USR123456 active";

      const result = maskAllPII(text);

      expect(result).toBe("User [MASKED_ID] active");
    });

    it("should handle text with no PII", () => {
      const text = "This is a normal message";

      const result = maskAllPII(text);

      expect(result).toBe("This is a normal message");
    });

    it("should handle empty string", () => {
      expect(maskAllPII("")).toBe("");
    });

    it("should handle complex text with multiple PII types", () => {
      const text = `

        Ticket submitted by user@company.com (ID: EMP98765).

        Contact: +1-555-444-3333

        Additional email: support@helpdesk.org

        Reference: USR11111

      `;

      const result = maskAllPII(text);

      expect(result).toContain("[MASKED_EMAIL]");

      expect(result).toContain("[MASKED_PHONE]");

      expect(result).toContain("[MASKED_ID]");

      expect(result).not.toContain("user@company.com");

      expect(result).not.toContain("555-444-3333");

      expect(result).not.toContain("EMP98765");
    });

    it("should preserve non-PII content", () => {
      const text =
        "The server is down. Error code: 500. Contact admin@site.com";

      const result = maskAllPII(text);

      expect(result).toContain("The server is down");

      expect(result).toContain("Error code: 500");

      expect(result).toContain("[MASKED_EMAIL]");
    });
  });
});
