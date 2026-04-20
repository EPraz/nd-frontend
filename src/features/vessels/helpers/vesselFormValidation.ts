export const VESSEL_EMAIL_ERROR_MESSAGE =
  "Enter a valid vessel email address, for example master@vesselmail.com.";

export const VESSEL_FORM_ERROR_TOAST_MESSAGE =
  "Please review the highlighted fields before saving the vessel.";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function normalizeVesselValue(value: string) {
  return value.trim();
}

export function getVesselEmailError(email: string) {
  const normalized = normalizeVesselValue(email);
  if (!normalized) return null;
  return EMAIL_REGEX.test(normalized) ? null : VESSEL_EMAIL_ERROR_MESSAGE;
}

export function normalizeVesselApiErrorMessage(message: string | null | undefined) {
  if (!message) return "We couldn't save the vessel right now. Please try again.";

  if (message.toLowerCase().includes("email must be an email")) {
    return VESSEL_EMAIL_ERROR_MESSAGE;
  }

  return message;
}
