export function maskEmails(text: string): string {
  return text.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/g,
    "[MASKED_EMAIL]"
  );
}

export function maskPhones(text: string): string {
  // Match phone numbers with various formats: +1-555-123-4567, 555.123.4567, 555 123 4567, 5551234567

  // Match optional + at start, then phone number pattern

  return text.replace(
    /\+?\b(\d{1,2}[-.\ s]?)?(\d{3})[-.\ s]?(\d{3})[-.\ s]?(\d{4})\b/g,
    "[MASKED_PHONE]"
  );
}

export function maskUserIds(text: string): string {
  return text.replace(/\b([A-Z]{2,10}\d{2,6})\b/g, "[MASKED_ID]");
}

export function maskAllPII(text: string): string {
  let result = text;

  result = maskEmails(result);

  result = maskPhones(result);

  result = maskUserIds(result);

  return result;
}
