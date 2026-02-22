import { VesselProfileDto } from "../features/vessels/contracts/vessel.contract";

export type AssetType = "VESSEL" | "STORE" | "BARBERSHOP" | "VEHICLE" | "OTHER";

export type AssetDto = {
  id: string;
  projectId: string;
  type: AssetType;
  name: string;
  status: string;
  createdAt: string;
  vessel?: VesselProfileDto;
};

export type CreateAssetInput =
  | {
      type: "VESSEL";
      name: string;
      identifierType: "IMO";
      imo: string;
      flag?: string;
    }
  | {
      type: "VESSEL";
      name: string;
      identifierType: "LICENSE";
      licenseNumber: string;
      flag?: string;
    }
  | { type: Exclude<AssetType, "VESSEL">; name: string };
