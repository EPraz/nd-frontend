import { AssetDto } from "@/src/contracts/assets.contract";

export type CrewStatus = "ACTIVE" | "INACTIVE";
export type CrewInactiveReason = "VACATION" | "INJURED" | "OTHER";
export type CrewDepartment =
  | "DECK"
  | "ENGINE"
  | "ELECTRICAL"
  | "CATERING"
  | "OTHER";

export type CrewDto = {
  id: string;
  assetId: string;
  assetName: string | null;
  fullName: string;
  nationality: string | null;
  dateOfBirth: string | null;
  passportNumber: string | null;
  seafarerId: string | null;
  personalEmail: string | null;
  rank: string | null;
  department: CrewDepartment | null;
  photoUrl: string | null;
  photoFileName: string | null;
  status: CrewStatus;
  inactiveReason: CrewInactiveReason | null;
  dateOfEmbarkation: string | null;
  portOfEmbarkation: string | null;
  expectedDateOfDisembarkation: string | null;
  nextVacationDate: string | null;
  contractType: string | null;
  operatingCompany: string | null;
  crewManagementAgency: string | null;
  totalSeaExperienceYears: number | null;
  yearsInCurrentRank: number | null;
  vesselTypeExperience: string | null;
  previousVessels: string | null;
  timeWithCurrentCompanyMonths: number | null;
  onboardFamiliarizationDate: string | null;
  familiarizationChecklistCompleted: boolean;
  crewDigitalSignatureUrl: string | null;
  responsibleOfficer: string | null;
  medicalCertificateValid: boolean | null;
  medicalCertificateExpirationDate: string | null;
  medicalRestrictions: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
  deletedByUserName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  asset: AssetDto | null;
};

export type CreateCrewInput = {
  assetId: string;
  fullName: string;
  nationality?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  seafarerId?: string;
  personalEmail?: string;
  rank?: string;
  department?: CrewDepartment;
  status?: CrewStatus;
  inactiveReason?: CrewInactiveReason;
  dateOfEmbarkation?: string;
  portOfEmbarkation?: string;
  expectedDateOfDisembarkation?: string;
  nextVacationDate?: string;
  contractType?: string;
  operatingCompany?: string;
  crewManagementAgency?: string;
  totalSeaExperienceYears?: number;
  yearsInCurrentRank?: number;
  vesselTypeExperience?: string;
  previousVessels?: string;
  timeWithCurrentCompanyMonths?: number;
  onboardFamiliarizationDate?: string;
  familiarizationChecklistCompleted?: boolean;
  crewDigitalSignatureUrl?: string;
  responsibleOfficer?: string;
  medicalCertificateValid?: boolean;
  medicalCertificateExpirationDate?: string;
  medicalRestrictions?: string;
  notes?: string;
};
