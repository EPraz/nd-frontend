import type { AssetDto } from "@/src/contracts/assets.contract";
import {
  CreateCrewInput,
  CrewDepartment,
  CrewDto,
  CrewInactiveReason,
  CrewStatus,
} from "../contracts";

function toDateOnly(value?: string | null): string {
  return value ? value.slice(0, 10) : "";
}

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export type CrewFormValues = {
  assetId: string | null;
  selectedVessel: AssetDto | null;
  fullName: string;
  nationality: string;
  dateOfBirth: string;
  passportNumber: string;
  seafarerId: string;
  personalEmail: string;
  rank: string;
  department: CrewDepartment | null;
  status: CrewStatus;
  inactiveReason: CrewInactiveReason | null;
  dateOfEmbarkation: string;
  portOfEmbarkation: string;
  expectedDateOfDisembarkation: string;
  nextVacationDate: string;
  contractType: string;
  operatingCompany: string;
  crewManagementAgency: string;
  totalSeaExperienceYears: string;
  yearsInCurrentRank: string;
  vesselTypeExperience: string;
  previousVessels: string;
  timeWithCurrentCompanyMonths: string;
  onboardFamiliarizationDate: string;
  familiarizationChecklistCompleted: boolean;
  crewDigitalSignatureUrl: string;
  responsibleOfficer: string;
  medicalCertificateValid: boolean | null;
  medicalCertificateExpirationDate: string;
  medicalRestrictions: string;
  notes: string;
};

export function emptyCrewFormValues(): CrewFormValues {
  return {
    assetId: null,
    selectedVessel: null,
    fullName: "",
    nationality: "",
    dateOfBirth: "",
    passportNumber: "",
    seafarerId: "",
    personalEmail: "",
    rank: "",
    department: null,
    status: "ACTIVE",
    inactiveReason: null,
    dateOfEmbarkation: "",
    portOfEmbarkation: "",
    expectedDateOfDisembarkation: "",
    nextVacationDate: "",
    contractType: "",
    operatingCompany: "",
    crewManagementAgency: "",
    totalSeaExperienceYears: "",
    yearsInCurrentRank: "",
    vesselTypeExperience: "",
    previousVessels: "",
    timeWithCurrentCompanyMonths: "",
    onboardFamiliarizationDate: "",
    familiarizationChecklistCompleted: false,
    crewDigitalSignatureUrl: "",
    responsibleOfficer: "",
    medicalCertificateValid: null,
    medicalCertificateExpirationDate: "",
    medicalRestrictions: "",
    notes: "",
  };
}

export function crewFormFromDto(dto: CrewDto): CrewFormValues {
  return {
    assetId: dto.assetId,
    selectedVessel: dto.asset ?? null,
    fullName: dto.fullName ?? "",
    nationality: dto.nationality ?? "",
    dateOfBirth: toDateOnly(dto.dateOfBirth),
    passportNumber: dto.passportNumber ?? "",
    seafarerId: dto.seafarerId ?? "",
    personalEmail: dto.personalEmail ?? "",
    rank: dto.rank ?? "",
    department: dto.department ?? null,
    status: dto.status,
    inactiveReason: dto.inactiveReason ?? null,
    dateOfEmbarkation: toDateOnly(dto.dateOfEmbarkation),
    portOfEmbarkation: dto.portOfEmbarkation ?? "",
    expectedDateOfDisembarkation: toDateOnly(
      dto.expectedDateOfDisembarkation,
    ),
    nextVacationDate: toDateOnly(dto.nextVacationDate),
    contractType: dto.contractType ?? "",
    operatingCompany: dto.operatingCompany ?? "",
    crewManagementAgency: dto.crewManagementAgency ?? "",
    totalSeaExperienceYears:
      dto.totalSeaExperienceYears === null
        ? ""
        : String(dto.totalSeaExperienceYears),
    yearsInCurrentRank:
      dto.yearsInCurrentRank === null ? "" : String(dto.yearsInCurrentRank),
    vesselTypeExperience: dto.vesselTypeExperience ?? "",
    previousVessels: dto.previousVessels ?? "",
    timeWithCurrentCompanyMonths:
      dto.timeWithCurrentCompanyMonths === null
        ? ""
        : String(dto.timeWithCurrentCompanyMonths),
    onboardFamiliarizationDate: toDateOnly(dto.onboardFamiliarizationDate),
    familiarizationChecklistCompleted: dto.familiarizationChecklistCompleted,
    crewDigitalSignatureUrl: dto.crewDigitalSignatureUrl ?? "",
    responsibleOfficer: dto.responsibleOfficer ?? "",
    medicalCertificateValid: dto.medicalCertificateValid,
    medicalCertificateExpirationDate: toDateOnly(
      dto.medicalCertificateExpirationDate,
    ),
    medicalRestrictions: dto.medicalRestrictions ?? "",
    notes: dto.notes ?? "",
  };
}

export function toCreateCrewInput(v: CrewFormValues): CreateCrewInput {
  if (!v.assetId) throw new Error("Missing assetId");

  return {
    assetId: v.assetId,
    fullName: v.fullName.trim(),
    nationality: v.nationality.trim() || undefined,
    dateOfBirth: v.dateOfBirth.trim() || undefined,
    passportNumber: v.passportNumber.trim() || undefined,
    seafarerId: v.seafarerId.trim() || undefined,
    personalEmail: v.personalEmail.trim() || undefined,
    rank: v.rank.trim() || undefined,
    department: v.department ?? undefined,
    status: v.status,
    inactiveReason:
      v.status === "INACTIVE" ? v.inactiveReason ?? undefined : undefined,
    dateOfEmbarkation: v.dateOfEmbarkation.trim() || undefined,
    portOfEmbarkation: v.portOfEmbarkation.trim() || undefined,
    expectedDateOfDisembarkation:
      v.expectedDateOfDisembarkation.trim() || undefined,
    nextVacationDate: v.nextVacationDate.trim() || undefined,
    contractType: v.contractType.trim() || undefined,
    operatingCompany: v.operatingCompany.trim() || undefined,
    crewManagementAgency: v.crewManagementAgency.trim() || undefined,
    totalSeaExperienceYears: toOptionalNumber(v.totalSeaExperienceYears),
    yearsInCurrentRank: toOptionalNumber(v.yearsInCurrentRank),
    vesselTypeExperience: v.vesselTypeExperience.trim() || undefined,
    previousVessels: v.previousVessels.trim() || undefined,
    timeWithCurrentCompanyMonths: toOptionalNumber(v.timeWithCurrentCompanyMonths),
    onboardFamiliarizationDate:
      v.onboardFamiliarizationDate.trim() || undefined,
    familiarizationChecklistCompleted: v.familiarizationChecklistCompleted,
    crewDigitalSignatureUrl: v.crewDigitalSignatureUrl.trim() || undefined,
    responsibleOfficer: v.responsibleOfficer.trim() || undefined,
    medicalCertificateValid:
      v.medicalCertificateValid === null ? undefined : v.medicalCertificateValid,
    medicalCertificateExpirationDate:
      v.medicalCertificateExpirationDate.trim() || undefined,
    medicalRestrictions: v.medicalRestrictions.trim() || undefined,
    notes: v.notes.trim() || undefined,
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
  return {
    ...toCreateCrewInput({
      ...values,
      assetId: fixedAssetId ?? values.assetId,
    } as CrewFormValues),
  };
}
