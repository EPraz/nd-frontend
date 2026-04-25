import {
  RegistryTablePill,
  RegistryTableTextStack,
  type Column,
} from "@/src/components/ui/table";
import { Text } from "@/src/components/ui/text/Text";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { View } from "react-native";
import type { CrewBulkUploadRowDto } from "../contracts/crewBulkUpload.contract";
import {
  actionTone,
  commitTone,
  firstIssueMessage,
  issueTone,
  readNormalizedText,
  summarizeIssues,
} from "./crewBulkUploadSession.helpers";

function IssueSummary({ row }: { row: CrewBulkUploadRowDto }) {
  return (
    <View className="gap-0.5">
      <Text
        className={["text-[12px] font-semibold", issueTone(row.issues)].join(" ")}
        numberOfLines={1}
      >
        {summarizeIssues(row.issues)}
      </Text>
      <Text className="text-[11px] text-muted" numberOfLines={1}>
        {firstIssueMessage(row.issues)}
      </Text>
    </View>
  );
}

function CommitSummary({ row }: { row: CrewBulkUploadRowDto }) {
  return (
    <View className="gap-1">
      <RegistryTablePill
        label={humanizeTechnicalLabel(row.commitStatus)}
        tone={commitTone(row.commitStatus)}
      />
      <Text className="text-[11px] text-muted" numberOfLines={1}>
        {row.committedCrewMemberName ?? "Pending session decision"}
      </Text>
    </View>
  );
}

export function buildCrewColumns(): Column<CrewBulkUploadRowDto>[] {
  return [
    {
      key: "row",
      header: "Crew row",
      flex: 1.25,
      render: (row) => (
        <RegistryTableTextStack
          primary={row.displayLabel ?? `Crew Row ${row.rowNumber}`}
          secondary={`${row.sheetName} - Row ${row.rowNumber}`}
        />
      ),
    },
    {
      key: "vessel",
      header: "Vessel",
      flex: 1.05,
      render: (row) => (
        <RegistryTableTextStack
          primary={row.matchedAssetName ?? readNormalizedText(row, "assetName") ?? "--"}
          secondary={
            readNormalizedText(row, "vesselImo")
              ? `IMO ${readNormalizedText(row, "vesselImo")}`
              : readNormalizedText(row, "vesselLicenseNumber") ?? "Context required"
          }
        />
      ),
    },
    {
      key: "action",
      header: "Action",
      flex: 0.9,
      render: (row) => (
        <RegistryTablePill
          label={humanizeTechnicalLabel(row.proposedAction)}
          tone={actionTone(row.proposedAction)}
        />
      ),
    },
    {
      key: "match",
      header: "Match",
      flex: 1.15,
      render: (row) => (
        <RegistryTableTextStack
          primary={
            row.matchedCrewMemberName ??
            row.committedCrewMemberName ??
            "New crew profile"
          }
          secondary={
            row.matchedCrewMemberName
              ? "Existing crew match"
              : row.committedCrewMemberName
                ? "Committed crew row"
                : "No existing identity match"
          }
        />
      ),
    },
    {
      key: "issues",
      header: "Issues",
      flex: 1.7,
      render: (row) => <IssueSummary row={row} />,
    },
    {
      key: "commit",
      header: "Commit",
      flex: 1,
      render: (row) => <CommitSummary row={row} />,
    },
  ];
}

export function buildCertificateColumns(): Column<CrewBulkUploadRowDto>[] {
  return [
    {
      key: "row",
      header: "Certificate row",
      flex: 1.1,
      render: (row) => (
        <RegistryTableTextStack
          primary={row.displayLabel ?? `Certificate Row ${row.rowNumber}`}
          secondary={`${row.sheetName} - Row ${row.rowNumber}`}
        />
      ),
    },
    {
      key: "certificate",
      header: "Certificate",
      flex: 1.35,
      render: (row) => (
        <RegistryTableTextStack
          primary={
            readNormalizedText(row, "certificateType") ??
            "Certificate pending mapping"
          }
          secondary={
            readNormalizedText(row, "certificateNumber") ?? "No number provided"
          }
        />
      ),
    },
    {
      key: "crewReference",
      header: "Crew reference",
      flex: 1.2,
      render: (row) => (
        <RegistryTableTextStack
          primary={readNormalizedText(row, "fullName") ?? "Crew match pending"}
          secondary={
            readNormalizedText(row, "crewReference") ?? "No crew id in workbook"
          }
        />
      ),
    },
    {
      key: "issuer",
      header: "Issuer / dates",
      flex: 1.3,
      render: (row) => (
        <RegistryTableTextStack
          primary={
            readNormalizedText(row, "issuingAuthority") ?? "Issuer pending review"
          }
          secondary={`Expiry ${readNormalizedText(row, "expiryDate") ?? "not provided"}`}
        />
      ),
    },
    {
      key: "issues",
      header: "Issues",
      flex: 1.55,
      render: (row) => <IssueSummary row={row} />,
    },
    {
      key: "mode",
      header: "Mode",
      flex: 0.85,
      render: () => <RegistryTablePill label="Preview" tone="accent" />,
    },
  ];
}
