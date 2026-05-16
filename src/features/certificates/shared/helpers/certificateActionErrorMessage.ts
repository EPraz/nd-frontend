export function certificateActionErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (error instanceof Error) {
    const message = error.message.trim();
    if (message) return message;
  }

  if (typeof error === "string") {
    const message = error.trim();
    if (message) return message;
  }

  return fallback;
}
