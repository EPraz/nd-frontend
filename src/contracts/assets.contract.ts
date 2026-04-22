import { VesselProfileDto } from "../features/vessels/core";

export type AssetType = "VESSEL" | "STORE" | "BARBERSHOP" | "VEHICLE" | "OTHER";

export type AssetDto = {
  id: string;
  projectId: string;
  type: AssetType;
  name: string;
  imageUrl: string | null;
  imageFileName: string | null;
  status: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
  deletedByUserName: string | null;
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
