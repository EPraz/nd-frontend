import { Button } from "@/src/components/ui/button/Button";
import {
  RegistryHeaderActionButton,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
  RegistryWorkspaceSection,
  type RegistrySummaryItem,
} from "@/src/components/ui/registryWorkspace";
import { Text } from "@/src/components/ui/text/Text";
import { useProjectContext } from "@/src/context/ProjectProvider";
import { useProjectEntitlements } from "@/src/context/ProjectEntitlementsProvider";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import type {
  ProjectModuleEntitlementDto,
  UpdateProjectModuleEntitlementsDto,
} from "@/src/contracts/project-entitlements.contract";
import { canUser } from "@/src/security/rolePermissions";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";

function cloneModules(modules: ProjectModuleEntitlementDto[]) {
  return modules.map((module) => ({
    ...module,
    submodules: module.submodules.map((submodule) => ({ ...submodule })),
  }));
}

function countChangedModules(
  baseline: ProjectModuleEntitlementDto[] | undefined,
  draft: ProjectModuleEntitlementDto[],
) {
  if (!baseline) return 0;

  const baselineByKey = new Map(
    baseline.map((module) => [module.key, module.enabled]),
  );

  return draft.filter(
    (module) => baselineByKey.get(module.key) !== module.enabled,
  ).length;
}

function moduleIconName(key: string): keyof typeof Ionicons.glyphMap {
  switch (key) {
    case "vessels":
      return "boat-outline";
    case "certificates":
      return "document-text-outline";
    case "crew":
      return "people-outline";
    case "maintenance":
      return "construct-outline";
    case "fuel":
      return "water-outline";
    default:
      return "layers-outline";
  }
}

function alertClasses(tone: "danger" | "info") {
  if (tone === "danger") {
    return {
      surface: "border-destructive/30 bg-destructive/10",
      title: "text-destructive",
    };
  }

  return {
    surface: "border-sky-400/25 bg-sky-400/10",
    title: "text-sky-100",
  };
}

function SettingsAlert({
  tone,
  title,
  body,
}: {
  tone: "danger" | "info";
  title: string;
  body: string;
}) {
  const ui = alertClasses(tone);

  return (
    <View className={["rounded-[20px] border px-5 py-4", ui.surface].join(" ")}>
      <Text className={["text-[15px] font-semibold", ui.title].join(" ")}>
        {title}
      </Text>
      <Text className="mt-2 text-[13px] leading-[20px] text-muted">{body}</Text>
    </View>
  );
}

function SettingsToggle({
  label,
  value,
  onPress,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={`Toggle ${label} module availability`}
      accessibilityState={{ checked: value, disabled }}
      className={[
        "min-w-[116px] gap-2 rounded-[18px] border px-3 py-2.5",
        value
          ? "border-accent/35 bg-accent/12"
          : "border-shellLine bg-shellPanel",
        disabled ? "opacity-50" : "opacity-100",
      ].join(" ")}
    >
      <Text
        className={[
          "text-[12px] font-semibold",
          value ? "text-accent" : "text-textMain",
        ].join(" ")}
      >
        {value ? "Enabled" : "Disabled"}
      </Text>

      <View
        className={[
          "h-6 w-11 rounded-full px-1",
          value ? "bg-accent/25" : "bg-shellGlass",
        ].join(" ")}
      >
        <View
          className={[
            "mt-1 h-4 w-4 rounded-full",
            value ? "ml-auto bg-accent" : "ml-0 bg-shellLine",
          ].join(" ")}
        />
      </View>
    </Pressable>
  );
}

function ModuleSettingCard({
  module,
  disabled,
  onToggle,
}: {
  module: ProjectModuleEntitlementDto;
  disabled: boolean;
  onToggle: () => void;
}) {
  const isEnabled = module.enabled;

  return (
    <View className="gap-3 rounded-[22px] border border-shellLine bg-shellCanvas p-5 web:h-full">
      <View className="flex-row items-start gap-4">
        <View
          className={[
            "h-11 w-11 items-center justify-center rounded-[18px] border",
            isEnabled
              ? "border-accent/35 bg-accent/12"
              : "border-shellLine bg-shellPanel",
          ].join(" ")}
        >
          <Ionicons
            name={moduleIconName(module.key)}
            size={19}
            className={isEnabled ? "text-accent" : "text-muted"}
          />
        </View>

        <View className="min-w-0 flex-1 gap-1.5">
          <Text className="text-[18px] leading-[1.2] font-semibold text-textMain">
            {module.label}
          </Text>
          <Text className="text-[13px] leading-[20px] text-muted">
            {module.description}
          </Text>
        </View>

        <SettingsToggle
          label={module.label}
          value={isEnabled}
          onPress={onToggle}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

export default function ProjectModuleSettingsScreen() {
  const { projectName } = useProjectContext();
  const { session } = useSessionContext();
  const { show } = useToast();
  const { entitlements, loading, saving, error, save, refresh } =
    useProjectEntitlements();

  const [draft, setDraft] = useState<ProjectModuleEntitlementDto[]>([]);

  useEffect(() => {
    if (entitlements?.modules) {
      setDraft(cloneModules(entitlements.modules));
    }
  }, [entitlements]);

  const hasChanges = useMemo(() => {
    if (!entitlements) return false;
    return JSON.stringify(entitlements.modules) !== JSON.stringify(draft);
  }, [draft, entitlements]);

  const enabledCount = useMemo(
    () => draft.filter((module) => module.enabled).length,
    [draft],
  );
  const disabledCount = draft.length - enabledCount;
  const canConfigureProject = canUser(session, "PROJECT_CONFIGURE");
  const changedCount = useMemo(
    () => countChangedModules(entitlements?.modules, draft),
    [draft, entitlements?.modules],
  );

  const summaryItems = useMemo<RegistrySummaryItem[]>(
    () => [
      {
        label: "Enabled",
        value: String(enabledCount),
        helper:
          enabledCount === 1
            ? "module currently live for this project"
            : "modules currently live for this project",
        tone: enabledCount > 0 ? "ok" : "neutral",
      },
      {
        label: "Disabled",
        value: String(disabledCount),
        helper: "hidden from this project baseline",
        tone: disabledCount > 0 ? "info" : "neutral",
      },
      {
        label: "Pending changes",
        value: String(hasChanges ? changedCount : 0),
        helper: hasChanges
          ? "module decisions not saved yet"
          : "all module decisions saved",
        tone: hasChanges ? "warn" : "ok",
      },
    ],
    [changedCount, disabledCount, enabledCount, hasChanges],
  );

  function handleToggleModule(moduleKey: string) {
    setDraft((current) =>
      current.map((module) =>
        module.key !== moduleKey
          ? module
          : {
              ...module,
              enabled: !module.enabled,
            },
      ),
    );
  }

  function handleReset() {
    setDraft(entitlements?.modules ? cloneModules(entitlements.modules) : []);
  }

  async function handleSave() {
    const payload: UpdateProjectModuleEntitlementsDto = {
      modules: draft.map((module) => ({
        key: module.key,
        enabled: module.enabled,
        submodules: [],
      })),
    };

    try {
      await save(payload);
      show("Project settings saved", "success");
    } catch {
      show("Failed to save project settings", "error");
    }
  }

  if (!canConfigureProject) {
    return (
      <View className="gap-5 p-4 web:p-6 pb-10">
        <RegistryWorkspaceHeader
          title="Project settings"
          eyebrow="Project control surface"
          subtitle={`Review which product areas are available inside ${projectName}. Only admins can change these decisions.`}
        />

        <RegistrySummaryStrip
          columns={3}
          items={[
            {
              label: "Access",
              value: "Restricted",
              helper: "only admin users can change module availability",
              tone: "danger",
            },
            {
              label: "Role",
              value: session?.role ?? "Unknown",
              helper: "current session authority",
              tone: "info",
            },
            {
              label: "Settings mode",
              value: "View only",
              helper: "this page is not editable in your current role",
              tone: "neutral",
            },
          ]}
        />

        <RegistryWorkspaceSection
          title="Access restricted"
          subtitle="Ask an admin user to manage which modules are visible for this project."
        >
          <SettingsAlert
            tone="danger"
            title="Admin permissions required"
            body="This surface controls project-wide availability for the main product modules. It stays read-only until an admin opens it."
          />
        </RegistryWorkspaceSection>
      </View>
    );
  }

  return (
    <View className="gap-5 p-4 web:p-6 pb-10">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Project settings"
          eyebrow="Project control surface"
          subtitle={`Control which product areas are available inside ${projectName}. Save once here and the matching vessel surfaces inherit automatically.`}
          actions={
            <>
              <RegistryHeaderActionButton
                variant="soft"
                iconName="refresh-outline"
                onPress={refresh}
                loading={loading}
              >
                Refresh
              </RegistryHeaderActionButton>

              <Button
                variant="outline"
                size="pillSm"
                onPress={handleReset}
                disabled={!hasChanges || saving}
                className="rounded-full"
              >
                Reset
              </Button>

              <Button
                variant="default"
                size="pillSm"
                onPress={handleSave}
                disabled={!hasChanges || saving}
                className="rounded-full"
                loading={saving}
                rightIcon={
                  <Ionicons
                    name="save-outline"
                    size={15}
                    className="text-textMain"
                  />
                }
              >
                Save changes
              </Button>
            </>
          }
        />

        <RegistrySummaryStrip items={summaryItems} columns={3} />
      </View>

      {error ? (
        <SettingsAlert
          tone="danger"
          title="Settings temporarily unavailable"
          body={error}
        />
      ) : null}

      {loading && draft.length === 0 ? (
        <RegistryWorkspaceSection
          title="Loading module availability"
          subtitle="Pulling the current project baseline before any change can be made."
        >
          <SettingsAlert
            tone="info"
            title="Loading current project baseline"
            body="Module availability is being prepared so this surface can show the right live state for the project."
          />
        </RegistryWorkspaceSection>
      ) : null}

      {draft.length > 0 ? (
        <RegistryWorkspaceSection
          title="Module availability"
          subtitle="Toggle modules once at project level. The matching vessel areas inherit from this same baseline automatically."
          actions={
            hasChanges ? (
              <View className="rounded-full border border-warning/35 bg-warning/10 px-3 py-1.5">
                <Text className="text-[11px] font-semibold text-warning">
                  Unsaved changes
                </Text>
              </View>
            ) : null
          }
        >
          <View className="gap-4 web:grid web:grid-cols-2 2xl:grid-cols-3">
            {draft.map((module) => (
              <ModuleSettingCard
                key={module.key}
                module={module}
                disabled={saving || loading}
                onToggle={() => handleToggleModule(module.key)}
              />
            ))}
          </View>
        </RegistryWorkspaceSection>
      ) : null}
    </View>
  );
}
