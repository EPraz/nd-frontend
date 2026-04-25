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

type VesselCreateSharedInput = {
  flag?: string;
  email?: string;
  callSign?: string;
  mmsi?: string;
  homePort?: string;
  vesselType?: string;
  classSociety?: string;
  builder?: string;
  yearBuilt?: number;
};

export type CreateAssetInput =
  | ({
      type: "VESSEL";
      name: string;
      identifierType: "IMO";
      imo: string;
    } & VesselCreateSharedInput)
  | ({
      type: "VESSEL";
      name: string;
      identifierType: "LICENSE";
      licenseNumber: string;
    } & VesselCreateSharedInput)
  | { type: Exclude<AssetType, "VESSEL">; name: string };
