import { VesselProfileDto } from "../features/vessels/core";
import type { PaginatedResponseDto } from "./pagination.contract";

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

export type AssetListStatsDto = {
  total: number;
  withProfile: number;
  withIMO: number;
  withLicense: number;
  withFlag: number;
  missingFlag: number;
};

export type AssetPageDto = PaginatedResponseDto<AssetDto> & {
  stats: AssetListStatsDto;
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
