import { Text } from "@/src/components";
import { View } from "react-native";
import { VesselImagePanel } from "../../components";
import { normalizeVesselValue } from "../../helpers/vesselFormValidation";
import { getVesselIdentifierPreview } from "./vesselEditor.helpers";
import type { VesselEditorFormValues, VesselEditorMode } from "./vesselEditor.types";

type Props = {
  mode: VesselEditorMode;
  values: VesselEditorFormValues;
  imagePreviewUrl?: string | null;
  storedFileName?: string | null;
  pendingFileName?: string | null;
  onSelectImage: () => void;
  onRemoveImage: () => void;
  disabled?: boolean;
  busy?: boolean;
};

function PreviewItem({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "accent" | "success" | "warning";
}) {
  const dotStyle =
    tone === "success"
      ? { backgroundColor: "#34d399" }
      : tone === "warning"
        ? { backgroundColor: "#fbbf24" }
        : tone === "accent"
          ? { backgroundColor: "#ff8f3a" }
          : { backgroundColor: "#94a3b8" };

  return (
    <View className="gap-1">
      <Text className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        <View className="h-2 w-2 rounded-full" style={dotStyle} />
        <Text className="text-[14px] font-semibold text-textMain">{value}</Text>
      </View>
    </View>
  );
}

export function VesselEditorPreviewRail({
  mode,
  values,
  imagePreviewUrl,
  storedFileName,
  pendingFileName,
  onSelectImage,
  onRemoveImage,
  disabled,
  busy,
}: Props) {
  const hasIdentity = Boolean(normalizeVesselValue(values.name));
  const hasIdentifier = getVesselIdentifierPreview(values) !== "-";
  const flag = normalizeVesselValue(values.flag);
  const email = normalizeVesselValue(values.email);
  const homePort = normalizeVesselValue(values.homePort);
  const callSign = normalizeVesselValue(values.callSign);
  const mmsi = normalizeVesselValue(values.mmsi);
  const vesselType = normalizeVesselValue(values.vesselType);
  const classSociety = normalizeVesselValue(values.classSociety);
  const builder = normalizeVesselValue(values.builder);
  const yearBuilt = values.yearBuilt.trim();
  const hasEmail = Boolean(email);

  return (
    <View className="gap-4 web:xl:sticky web:xl:top-6">
      <View className="overflow-hidden rounded-[28px] border border-shellLine bg-shellPanel">
        <View className="gap-1 border-b border-shellLine px-5 py-4">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            Live Preview
          </Text>
          <Text className="text-[18px] font-semibold text-textMain">
            {mode === "create" ? "New vessel baseline" : "Profile baseline"}
          </Text>
          <Text className="text-[13px] leading-[19px] text-muted">
            This is the identity the shell, quick view, and registry will read.
          </Text>
        </View>

        <View className="gap-4 p-5">
          <View className="gap-1">
            <Text className="text-[26px] font-semibold leading-[110%] text-textMain">
              {normalizeVesselValue(values.name) || "Unnamed vessel"}
            </Text>
            <Text className="text-[13px] text-muted">
              {[
                getVesselIdentifierPreview(values),
                flag || "No flag",
                vesselType || "Type pending",
              ].join(" | ")}
            </Text>
          </View>

          <View className="gap-4 rounded-[22px] border border-shellLine bg-shellCanvas p-4">
            <PreviewItem
              label="Identity"
              value={hasIdentity ? "Ready" : "Missing"}
              tone={hasIdentity ? "success" : "warning"}
            />
            <PreviewItem
              label="Identifier"
              value={getVesselIdentifierPreview(values)}
              tone={hasIdentifier ? "accent" : "warning"}
            />
            <PreviewItem
              label="Contact"
              value={hasEmail ? email : "Optional"}
              tone={hasEmail ? "success" : "neutral"}
            />
          </View>

          <View className="gap-3 rounded-[22px] border border-shellLine bg-shellCanvas px-4 py-4">
            <Text className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
              Profile details
            </Text>

            <View className="gap-3 web:grid web:grid-cols-2">
              <PreviewItem
                label="Flag"
                value={flag || "Not set"}
                tone={flag ? "accent" : "neutral"}
              />
              <PreviewItem
                label="Ops email"
                value={hasEmail ? email : "Not set"}
                tone={hasEmail ? "success" : "neutral"}
              />
              <PreviewItem
                label="Home port"
                value={homePort || "Not set"}
                tone={homePort ? "accent" : "neutral"}
              />
              <PreviewItem
                label="Call sign"
                value={callSign || "Not set"}
                tone={callSign ? "accent" : "neutral"}
              />
              <PreviewItem
                label="MMSI"
                value={mmsi || "Not set"}
                tone={mmsi ? "accent" : "neutral"}
              />
              <PreviewItem
                label="Vessel type"
                value={vesselType || "Not set"}
                tone={vesselType ? "accent" : "neutral"}
              />
              <PreviewItem
                label="Class"
                value={classSociety || "Not set"}
                tone={classSociety ? "accent" : "neutral"}
              />
              <PreviewItem
                label="Builder"
                value={builder || "Not set"}
                tone={builder ? "accent" : "neutral"}
              />
              <PreviewItem
                label="Year built"
                value={yearBuilt || "Not set"}
                tone={yearBuilt ? "accent" : "neutral"}
              />
            </View>
          </View>
        </View>
      </View>

      <VesselImagePanel
        imagePreviewUrl={imagePreviewUrl}
        storedFileName={storedFileName}
        pendingFileName={pendingFileName}
        onSelectImage={onSelectImage}
        onRemoveImage={onRemoveImage}
        canManageImage
        busy={busy}
        disabled={disabled}
        compact
      />
    </View>
  );
}
