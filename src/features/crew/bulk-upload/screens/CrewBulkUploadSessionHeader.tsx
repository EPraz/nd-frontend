import { Button } from "@/src/components";
import {
  RegistryHeaderActionButton,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import { Text } from "@/src/components/ui/text/Text";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import type { CrewBulkUploadSessionDto } from "../contracts/crewBulkUpload.contract";
import { getSessionSummaryItems } from "./crewBulkUploadSession.helpers";

type Props = {
  currentSession: CrewBulkUploadSessionDto;
  blockingCrewRowsCount: number;
  canCommit: boolean;
  actionLoading: boolean;
  onRefresh: () => void;
  onBackToWorkspace: () => void;
  onCommit: () => void;
  onDiscard: () => void;
  onOpenCrewModule: () => void;
  onOpenCrewCertificates: () => void;
};

export function CrewBulkUploadSessionHeader({
  currentSession,
  blockingCrewRowsCount,
  canCommit,
  actionLoading,
  onRefresh,
  onBackToWorkspace,
  onCommit,
  onDiscard,
  onOpenCrewModule,
  onOpenCrewCertificates,
}: Props) {
  const summaryItems = getSessionSummaryItems(currentSession);

  return (
    <View className="gap-4">
      <RegistryWorkspaceHeader
        title="Review Bulk Upload Session"
        eyebrow="Crew bulk upload review"
        subtitle={`Validate ${currentSession.sourceFileName}, correct the same session when needed, and commit crew data only when the operational picture is safe.`}
        actions={
          <>
            <RegistryHeaderActionButton
              variant="soft"
              iconName="chevron-back-outline"
              iconSide="left"
              onPress={onBackToWorkspace}
            >
              Bulk upload
            </RegistryHeaderActionButton>

            <RegistryHeaderActionButton
              variant="soft"
              iconName="refresh-outline"
              onPress={onRefresh}
            >
              Refresh
            </RegistryHeaderActionButton>

            {currentSession.status === "READY_FOR_REVIEW" ? (
              <>
                <Button
                  variant="softDestructive"
                  size="pillSm"
                  className="rounded-full"
                  onPress={onDiscard}
                  loading={actionLoading}
                  rightIcon={
                    <Ionicons
                      name="trash-outline"
                      size={15}
                      className="text-destructive"
                    />
                  }
                >
                  Discard session
                </Button>

                <RegistryHeaderActionButton
                  variant="default"
                  iconName="checkmark-circle-outline"
                  iconSize={15}
                  onPress={onCommit}
                  disabled={!canCommit}
                  loading={actionLoading}
                >
                  Commit crew data
                </RegistryHeaderActionButton>
              </>
            ) : (
              <>
                <RegistryHeaderActionButton
                  variant="outline"
                  onPress={onOpenCrewModule}
                >
                  Open crew module
                </RegistryHeaderActionButton>

                {currentSession.status === "COMMITTED" ? (
                  <RegistryHeaderActionButton
                    variant="outline"
                    onPress={onOpenCrewCertificates}
                  >
                    Open crew certificates
                  </RegistryHeaderActionButton>
                ) : null}
              </>
            )}
          </>
        }
      />

      <RegistrySummaryStrip items={summaryItems} />

      {currentSession.status === "READY_FOR_REVIEW" &&
      blockingCrewRowsCount > 0 ? (
        <View className="rounded-[20px] border border-destructive/30 bg-destructive/10 p-5">
          <Text className="text-[18px] font-semibold text-textMain">
            Commit is blocked
          </Text>
          <Text className="mt-2 text-[13px] leading-[20px] text-destructive">
            {blockingCrewRowsCount} crew row
            {blockingCrewRowsCount === 1 ? "" : "s"} still have critical issues.
            Correct this same session or discard it before trying to commit.
          </Text>
          <Text className="mt-2 text-[12px] leading-[18px] text-destructive">
            The commit action stays disabled until the blocking rows are removed
            from the workbook or reuploaded with corrected identity, vessel, or
            rank data.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
