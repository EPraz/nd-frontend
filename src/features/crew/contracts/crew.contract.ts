import { AssetDto } from "@/src/contracts/assets.contract";

export type CrewStatus = "ACTIVE" | "INACTIVE";

export type CrewDto = {
  id: string;
  assetId: string;
  assetName: string;
  fullName: string;
  rank: string | null;
  nationality: string | null;
  documentId: string | null;
  status: CrewStatus;
  createdAt: string;
  asset: AssetDto;
};

export type CreateCrewInput = {
  assetId: string;
  fullName: string;
  rank?: string;
  nationality?: string;
  documentId?: string;
  status?: CrewStatus;
};
