export function getFileExtension(file: File): string {
  const parts = file.name.split(".");

  if (parts.length === 1) return "";

  return parts.pop()?.toLowerCase() ?? "";
}

export function isValidFileType(file: File): boolean {
  const allowed = ["pdf", "png", "jpg", "jpeg", "txt"];

  return allowed.includes(getFileExtension(file));
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => resolve(e.target?.result as string);

    reader.onerror = reject;

    reader.readAsText(file);
  });
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => resolve(e.target?.result as string);

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}
