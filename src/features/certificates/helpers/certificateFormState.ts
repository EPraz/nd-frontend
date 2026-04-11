import type { UseFormSetValue } from "react-hook-form";
import type { CertificateFormValues } from "../contracts";

export function applyCertificateFormPatch(
  setValue: UseFormSetValue<CertificateFormValues>,
  patchValues: Partial<CertificateFormValues>,
) {
  for (const key of Object.keys(patchValues) as (keyof CertificateFormValues)[]) {
    const value = patchValues[key];
    if (value === undefined) continue;

    setValue(key, value as never, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }
}
