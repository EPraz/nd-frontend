import type { AssetDto } from "@/src/contracts/assets.contract";
import type { CertificateTypeDto } from "@/src/features/certificates/contracts";
import type { CrewDto } from "@/src/features/crew/contracts";
import type {
  ConfirmCrewCertificateIngestionResultDto,
  CrewCertificateDto,
  CrewCertificateIngestionDto,
  CrewCertificateRequirementDto,
  CrewComplianceSummaryDto,
} from "@/src/features/crew-certificates/contracts";

export function fakeCrewAsset(overrides: Partial<AssetDto> = {}): AssetDto {
  return {
    id: "vessel-one",
    projectId: "project-atlantic",
    type: "VESSEL",
    name: "MV Navigate One",
    imageUrl: null,
    imageFileName: null,
    status: "ACTIVE",
    isDeleted: false,
    deletedAt: null,
    deletedByUserId: null,
    deletedByUserName: null,
    createdAt: "2026-04-01T00:00:00.000Z",
    ...overrides,
  };
}

export function fakeCrewMember(overrides: Partial<CrewDto> = {}): CrewDto {
  const asset = fakeCrewAsset();

  return {
    id: "crew-master",
    assetId: asset.id,
    assetName: asset.name,
    fullName: "Andres Molina",
    nationality: "CO",
    dateOfBirth: "1985-01-10T00:00:00.000Z",
    passportNumber: "PA-123456",
    seafarerId: "SF-9988",
    personalEmail: "andres.molina@example.com",
    rank: "Master",
    department: "DECK",
    photoUrl: null,
    photoFileName: null,
    status: "ACTIVE",
    inactiveReason: null,
    dateOfEmbarkation: "2026-01-10T00:00:00.000Z",
    portOfEmbarkation: "Cartagena",
    expectedDateOfDisembarkation: null,
    nextVacationDate: null,
    contractType: "Rotation",
    operatingCompany: "Navigate Marine",
    crewManagementAgency: "ARXIS Crew",
    totalSeaExperienceYears: 12,
    yearsInCurrentRank: 5,
    vesselTypeExperience: "Offshore Supply Vessel",
    previousVessels: "MV Navigate Zero",
    timeWithCurrentCompanyMonths: 24,
    onboardFamiliarizationDate: "2026-01-11T00:00:00.000Z",
    familiarizationChecklistCompleted: true,
    crewDigitalSignatureUrl: null,
    responsibleOfficer: "Chief Officer",
    medicalCertificateValid: true,
    medicalCertificateExpirationDate: "2027-01-10T00:00:00.000Z",
    medicalRestrictions: null,
    isDeleted: false,
    deletedAt: null,
    deletedByUserId: null,
    deletedByUserName: null,
    notes: "Seeded crew member",
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-10T12:00:00.000Z",
    asset,
    ...overrides,
  };
}

export function fakeCrewCertificateType(
  overrides: Partial<CertificateTypeDto> = {},
): CertificateTypeDto {
  return {
    id: "type-master-coc",
    code: "MASTER_COC",
    name: "Master Certificate of Competency",
    description: "STCW certificate of competency for masters.",
    category: "STATUTORY",
    authority: "Flag State",
    typicalValidityMonths: 60,
    aliases: ["Master CoC", "COC"],
    scope: "GLOBAL",
    companyId: null,
    ...overrides,
  };
}

export function fakeCrewCertificateRequirement(
  overrides: Partial<CrewCertificateRequirementDto> = {},
): CrewCertificateRequirementDto {
  return {
    id: "crew-requirement-master-coc",
    crewMemberId: "crew-master",
    crewMemberName: "Andres Molina",
    crewRank: "Master",
    assetId: "vessel-one",
    assetName: "MV Navigate One",
    certificateTypeId: "type-master-coc",
    certificateCode: "MASTER_COC",
    certificateName: "Master Certificate of Competency",
    status: "MISSING",
    exemptedReason: null,
    notes: null,
    hasStructuredCertificate: false,
    structuredCertificateId: null,
    structuredCertificateWorkflowStatus: null,
    pendingIngestionId: null,
    pendingIngestionStatus: null,
    lastEvaluatedAt: null,
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-10T12:00:00.000Z",
    ...overrides,
  };
}

export function fakeCrewCertificateIngestion(
  overrides: Partial<CrewCertificateIngestionDto> = {},
): CrewCertificateIngestionDto {
  return {
    id: "crew-ingestion-1",
    crewMemberId: "crew-master",
    crewMemberName: "Andres Molina",
    crewRank: "Master",
    assetId: "vessel-one",
    assetName: "MV Navigate One",
    sourceKind: "REQUIREMENT",
    sourceRequirementId: "crew-requirement-master-coc",
    linkedCrewCertificateId: null,
    certificateTypeId: "type-master-coc",
    certificateCode: "MASTER_COC",
    certificateName: "Master Certificate of Competency",
    status: "READY_FOR_REVIEW",
    fileName: "master-coc.pdf",
    mimeType: "application/pdf",
    url: "/signed/crew-certificates/master-coc.pdf",
    checksum: null,
    extractionMethod: "PDF_TEXT",
    extractionConfidence: "HIGH",
    extractedTextPreview: "Master Certificate of Competency",
    extractionWarnings: [],
    candidateNumber: "COC-2026-001",
    candidateIssuer: "Flag State",
    candidateIssueDate: "2026-01-10T00:00:00.000Z",
    candidateExpiryDate: "2031-01-10T00:00:00.000Z",
    candidateNotes: "Candidate notes",
    uploadedByUserId: "user-1",
    confirmedByUserId: null,
    confirmedAt: null,
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-10T12:00:00.000Z",
    ...overrides,
  };
}

export function fakeCrewCertificate(
  overrides: Partial<CrewCertificateDto> = {},
): CrewCertificateDto {
  return {
    id: "crew-certificate-1",
    crewMemberId: "crew-master",
    crewMemberName: "Andres Molina",
    crewRank: "Master",
    assetId: "vessel-one",
    assetName: "MV Navigate One",
    certificateTypeId: "type-master-coc",
    certificateCode: "MASTER_COC",
    certificateName: "Master Certificate of Competency",
    number: "COC-2026-001",
    issuer: "Flag State",
    issueDate: "2026-01-10T00:00:00.000Z",
    expiryDate: "2031-01-10T00:00:00.000Z",
    status: "VALID",
    workflowStatus: "SUBMITTED",
    approvedAt: null,
    approvedByUserId: null,
    approvedByUserName: null,
    isDeleted: false,
    deletedAt: null,
    deletedByUserId: null,
    deletedByUserName: null,
    notes: "Candidate notes",
    attachmentCount: 0,
    attachments: [],
    requirementStatus: "UNDER_REVIEW",
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-10T12:00:00.000Z",
    ...overrides,
  };
}

export function fakeConfirmCrewCertificateIngestionResult(
  overrides: Partial<ConfirmCrewCertificateIngestionResultDto> = {},
): ConfirmCrewCertificateIngestionResultDto {
  return {
    ingestion: fakeCrewCertificateIngestion({ status: "CONFIRMED" }),
    certificate: fakeCrewCertificate({ id: "crew-certificate-created" }),
    requirement: null,
    ...overrides,
  };
}

export function fakeCrewComplianceSummary(
  overrides: Partial<CrewComplianceSummaryDto> = {},
): CrewComplianceSummaryDto {
  return {
    assetId: "vessel-one",
    assetName: "MV Navigate One",
    flagState: "Panama",
    vesselProfileFlag: "PA",
    msmcConfigured: true,
    fallbackMode: "MSMC",
    totalMinimumCrew: 5,
    currentCrewCount: 4,
    crewComplianceScore: 62,
    riskLevel: "HIGH",
    roleGaps: [
      {
        role: "Officer of the Watch",
        normalizedRole: "oow",
        department: "DECK",
        requiredCount: 1,
        currentCount: 0,
        missingCount: 1,
        certificateTypeId: "type-oow-coc",
        certificateName: "Officer of the Watch Certificate of Competency",
      },
    ],
    issues: [
      {
        code: "MISSING_ROLE",
        severity: "HIGH",
        message: "Missing required role: Officer of the Watch.",
        role: "Officer of the Watch",
        crewMemberId: null,
        crewMemberName: null,
        certificateTypeId: "type-oow-coc",
        certificateName: "Officer of the Watch Certificate of Competency",
      },
    ],
    updatedAt: "2026-04-10T12:00:00.000Z",
    ...overrides,
  };
}
