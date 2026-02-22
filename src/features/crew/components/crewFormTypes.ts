import type { AssetDto } from "@/src/contracts/assets.contract";
import { CreateCrewInput, CrewDto, CrewStatus } from "../contracts";

export type CrewFormValues = {
  assetId: string | null; // vessel selected
  selectedVessel: AssetDto | null;

  fullName: string;
  rank: string;
  nationality: string;
  documentId: string;

  status: CrewStatus; // SOURCE OF TRUTH

  documents: Array<{
    id: string;
    name: string;
    type: "PASSPORT" | "SEAMAN_BOOK" | "OTHER";
  }>;
};

export function emptyCrewFormValues(): CrewFormValues {
  return {
    assetId: null,
    selectedVessel: null,
    fullName: "",
    rank: "",
    nationality: "",
    documentId: "",
    status: "ACTIVE",
    documents: [],
  };
}

export function crewFormFromDto(dto: CrewDto): CrewFormValues {
  return {
    assetId: dto.assetId,
    selectedVessel: dto.asset ?? null, // backend: asset siempre viene
    fullName: dto.fullName ?? "",
    rank: dto.rank ?? "",
    nationality: dto.nationality ?? "",
    documentId: dto.documentId ?? "",
    status: dto.status,
    documents: [],
  };
}

export function toCreateCrewInput(v: CrewFormValues): CreateCrewInput {
  if (!v.assetId) throw new Error("Missing assetId");
  return {
    assetId: v.assetId,
    fullName: v.fullName.trim(),
    rank: v.rank.trim() || undefined,
    nationality: v.nationality.trim() || undefined,
    documentId: v.documentId.trim() || undefined,
    status: v.status,
  };
}

type ToUpdateCrewInputArgs = {
  values: CrewFormValues;
  fixedAssetId?: string | null;
};

export function toUpdateCrewInput({
  values,
  fixedAssetId = null,
}: ToUpdateCrewInputArgs): Partial<CreateCrewInput> {
  const assetId = fixedAssetId ?? values.assetId ?? undefined;

  return {
    assetId,

    // requerido en UI: lo mandas siempre
    fullName: values.fullName.trim(),

    // opcionales: si vacío -> undefined (no sobre-escribe con "")
    rank: values.rank.trim() ? values.rank.trim() : undefined,
    nationality: values.nationality.trim()
      ? values.nationality.trim()
      : undefined,
    documentId: values.documentId.trim() ? values.documentId.trim() : undefined,

    status: values.status,
  };
}
