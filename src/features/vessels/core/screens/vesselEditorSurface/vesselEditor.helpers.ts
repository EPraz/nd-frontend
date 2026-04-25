import type { CreateAssetInput } from "@/src/contracts/assets.contract";
import type {
  UpdateVesselProfileInput,
  VesselProfileDto,
} from "../../contracts/vessel.contract";
import { normalizeVesselValue } from "../../helpers/vesselFormValidation";
import type { VesselEditorFormValues } from "./vesselEditor.types";

export function emptyVesselEditorValues(): VesselEditorFormValues {
  return {
    identifierType: "IMO",
    name: "",
    imo: "",
    licenseNumber: "",
    flag: "PA",
    email: "",
    callSign: "",
    mmsi: "",
    homePort: "",
    vesselType: "",
    classSociety: "",
    builder: "",
    yearBuilt: "",
  };
}

export function formatVesselFlagCode(value: string) {
  return value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
}

export function buildVesselEditorValues(
  profile: VesselProfileDto | null | undefined,
  assetName = "",
): VesselEditorFormValues {
  return {
    identifierType: (profile?.identifierType ?? "IMO") as "IMO" | "LICENSE",
    name: assetName,
    imo: profile?.imo ?? "",
    licenseNumber: profile?.licenseNumber ?? "",
    flag: formatVesselFlagCode(profile?.flag ?? ""),
    email: profile?.email ?? "",
    callSign: profile?.callSign ?? "",
    mmsi: profile?.mmsi ?? "",
    homePort: profile?.homePort ?? "",
    vesselType: profile?.vesselType ?? "",
    classSociety: profile?.classSociety ?? "",
    builder: profile?.builder ?? "",
    yearBuilt: profile?.yearBuilt ? String(profile.yearBuilt) : "",
  };
}

export function getVesselIdentifierPreview(values: VesselEditorFormValues) {
  if (values.identifierType === "LICENSE") {
    const licenseNumber = normalizeVesselValue(values.licenseNumber);
    return licenseNumber ? `LIC ${licenseNumber}` : "-";
  }

  const imo = normalizeVesselValue(values.imo);
  return imo ? `IMO ${imo}` : "-";
}

export function canSubmitVesselEditor(values: VesselEditorFormValues) {
  if (!normalizeVesselValue(values.name)) return false;
  if (values.identifierType === "LICENSE") {
    return Boolean(normalizeVesselValue(values.licenseNumber));
  }
  return Boolean(normalizeVesselValue(values.imo));
}

export function toCreateVesselInput(
  values: VesselEditorFormValues,
): CreateAssetInput {
  const sharedProfile = {
    flag: formatVesselFlagCode(values.flag) || undefined,
    email: normalizeVesselValue(values.email) || undefined,
    callSign: normalizeVesselValue(values.callSign) || undefined,
    mmsi: normalizeVesselValue(values.mmsi) || undefined,
    homePort: normalizeVesselValue(values.homePort) || undefined,
    vesselType: normalizeVesselValue(values.vesselType) || undefined,
    classSociety: normalizeVesselValue(values.classSociety) || undefined,
    builder: normalizeVesselValue(values.builder) || undefined,
    yearBuilt: values.yearBuilt.trim() ? Number(values.yearBuilt) : undefined,
  } satisfies Partial<CreateAssetInput>;

  if (values.identifierType === "LICENSE") {
    return {
      type: "VESSEL",
      name: normalizeVesselValue(values.name),
      identifierType: "LICENSE",
      licenseNumber: normalizeVesselValue(values.licenseNumber),
      ...sharedProfile,
    };
  }

  return {
    type: "VESSEL",
    name: normalizeVesselValue(values.name),
    identifierType: "IMO",
    imo: normalizeVesselValue(values.imo),
    ...sharedProfile,
  };
}

export function toUpdateVesselProfileInput(
  values: VesselEditorFormValues,
): UpdateVesselProfileInput {
  return {
    identifierType: values.identifierType,
    imo:
      values.identifierType === "IMO"
        ? normalizeVesselValue(values.imo)
        : undefined,
    licenseNumber:
      values.identifierType === "LICENSE"
        ? normalizeVesselValue(values.licenseNumber)
        : undefined,
    flag: formatVesselFlagCode(values.flag) || undefined,
    email: normalizeVesselValue(values.email) || undefined,
    callSign: normalizeVesselValue(values.callSign) || undefined,
    mmsi: normalizeVesselValue(values.mmsi) || undefined,
    homePort: normalizeVesselValue(values.homePort) || undefined,
    vesselType: normalizeVesselValue(values.vesselType) || undefined,
    classSociety: normalizeVesselValue(values.classSociety) || undefined,
    builder: normalizeVesselValue(values.builder) || undefined,
    yearBuilt: values.yearBuilt.trim() ? Number(values.yearBuilt) : undefined,
  };
}
