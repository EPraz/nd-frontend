import {
  QuickViewFooterActions,
  QuickViewHeaderActions,
  QuickViewLeadSection,
  QuickViewMediaPanel,
  QuickViewModalFrame,
  QuickViewSectionCard,
  QuickViewSummaryBadge,
  Text,
} from "@/src/components";
import {
  RegistrySummaryStrip,
  type RegistrySummaryItem,
} from "@/src/components/ui/registryWorkspace";
import { formatDate } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View } from "react-native";
import type { FuelDto } from "../../../shared/contracts";
import { fuelDisplayTitle } from "../../../shared/helpers";

type Props = {
  fuel: FuelDto;
  projectId: string;
  onClose: () => void;
};

function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function eventTone(type: FuelDto["eventType"]): "ok" | "info" | "warn" | "accent" {
  switch (type) {
    case "CONSUMED":
      return "warn";
    case "TRANSFERRED":
      return "info";
    case "ADJUSTMENT":
      return "accent";
    case "BUNKERED":
    default:
      return "ok";
  }
}

export default function FuelQuickViewModal({
  fuel,
  projectId,
  onClose,
}: Props) {
  const router = useRouter();
  const vesselName = fuel.asset?.name ?? fuel.assetId;

  const profileSummaryItems: RegistrySummaryItem[] = [
    {
      label: "Fuel ID",
      value: fuel.id,
      helper: "Event reference",
      tone: "info",
    },
    {
      label: "Vessel",
      value: vesselName,
      helper: "Assigned asset",
      tone: "accent",
    },
    {
      label: "Quantity",
      value: `${fuel.quantity} ${fuel.unit}`,
      helper: "Logged amount",
      tone: "warn",
    },
    {
      label: "Date",
      value: formatDate(fuel.date),
      helper: "Event timestamp",
      tone: "ok",
    },
  ];

  const eventSummaryItems: RegistrySummaryItem[] = [
    {
      label: "Event type",
      value: humanize(fuel.eventType),
      helper: "Movement classification",
      tone: eventTone(fuel.eventType),
    },
    {
      label: "Fuel type",
      value: fuel.fuelType,
      helper: "Recorded product",
      tone: "info",
    },
    {
      label: "Location",
      value: fuel.location ?? "-",
      helper: "Logged place",
      tone: "accent",
    },
  ];

  const commercialSummaryItems: RegistrySummaryItem[] = [
    {
      label: "Price",
      value: fuel.price ?? "-",
      helper: "Recorded amount",
      tone: "warn",
    },
    {
      label: "Currency",
      value: fuel.currency ?? "-",
      helper: "Pricing currency",
      tone: "info",
    },
    {
      label: "Receipt status",
      value: "Pending upload",
      helper: "BDN / invoice evidence",
      tone: "accent",
    },
  ];

  const handleOpenView = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${fuel.assetId}/fuel/${fuel.id}`);
  };

  const handleEdit = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${fuel.assetId}/fuel/${fuel.id}/edit`);
  };

  return (
    <QuickViewModalFrame
      portalName={`Fuel-${fuel.id}`}
      open
      onClose={onClose}
      title="Fuel event"
      subtitle="Operational and commercial snapshot for the logged fuel record."
      headerActions={
        <QuickViewHeaderActions
          onClose={onClose}
          actions={[
            {
              label: "Edit",
              onPress: handleEdit,
              variant: "softAccent",
              leftIcon: (
                <Ionicons
                  name="create-outline"
                  size={16}
                  className="text-accent"
                />
              ),
            },
          ]}
        />
      }
      footer={
        <QuickViewFooterActions
          onClose={onClose}
          actions={[
            {
              label: "Open Fuel View",
              onPress: handleOpenView,
            },
          ]}
        />
      }
      scroll
      maxWidth={860}
    >
      <View className="gap-2.5">
        <QuickViewLeadSection
          asideWidth={280}
          main={
            <>
              <View className="gap-1.5">
                <View className="gap-1">
                  <Text className="text-[24px] font-semibold text-textMain">
                    {fuelDisplayTitle(fuel)}
                  </Text>
                  <Text className="text-[12px] text-muted">
                    {vesselName} | {formatDate(fuel.date)} | {fuel.quantity}{" "}
                    {fuel.unit}
                  </Text>
                </View>

                <View className="flex-row flex-wrap items-center gap-1.5">
                  <QuickViewSummaryBadge
                    label={`Event: ${humanize(fuel.eventType)}`}
                    tone={eventTone(fuel.eventType)}
                  />
                  <QuickViewSummaryBadge
                    label={`Fuel: ${fuel.fuelType}`}
                    tone="info"
                  />
                  <QuickViewSummaryBadge
                    label={`Location: ${fuel.location ?? "Not set"}`}
                    tone="warn"
                  />
                </View>
              </View>

              <Text className="max-w-[620px] text-[12px] leading-[16px] text-muted">
                Use this quick view to confirm quantity, location, and pricing
                before opening the full fuel entry.
              </Text>
            </>
          }
          aside={
            <QuickViewMediaPanel className="h-[128px] justify-center px-4">
              <View className="flex-row items-center gap-3">
                <View className="rounded-full border border-shellLine bg-shellPanel px-3 py-3">
                  <Ionicons
                    name="document-attach-outline"
                    size={30}
                    className="text-textMain"
                  />
                </View>

                <View className="min-w-0 flex-1 gap-0.5">
                  <Text className="text-[15px] font-semibold text-textMain">
                    Receipt / BDN
                  </Text>
                  <Text className="text-[11px] leading-[15px] text-muted">
                    Upload supporting evidence from edit mode to populate this
                    panel.
                  </Text>
                </View>
              </View>
            </QuickViewMediaPanel>
          }
        />

        <View className="mt-4 gap-1.5">
          <Text className="text-[14px] font-semibold text-textMain">
            Profile at a glance
          </Text>
          <RegistrySummaryStrip
            items={profileSummaryItems}
            size="compact"
            columns={4}
          />
        </View>
      </View>

      <View className="mt-1 flex-col gap-3 web:flex-row">
        <View className="flex-1 gap-1.5">
          <Text className="text-[14px] font-semibold text-textMain">
            Event Snapshot
          </Text>
          <RegistrySummaryStrip
            items={eventSummaryItems}
            size="compact"
            columns={3}
          />
        </View>

        <View className="flex-1 gap-1.5">
          <Text className="text-[14px] font-semibold text-textMain">
            Commercial Snapshot
          </Text>
          <RegistrySummaryStrip
            items={commercialSummaryItems}
            size="compact"
            columns={3}
          />
        </View>
      </View>

      {fuel.note?.trim() ? (
        <QuickViewSectionCard title="Operational Note" className="mt-1">
          <Text className="text-[12px] leading-[17px] text-muted">
            {fuel.note}
          </Text>
        </QuickViewSectionCard>
      ) : null}
    </QuickViewModalFrame>
  );
}
