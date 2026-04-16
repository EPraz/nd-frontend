import { Button } from "@/src/components/ui/button/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeaderRow,
  CardTitle,
} from "@/src/components/ui/card/Card";
import PageHeader from "@/src/components/ui/pageHeader/PageHeader";
import { Text } from "@/src/components/ui/text/Text";
import { useProjectContext } from "@/src/context/ProjectProvider";
import { useProjectEntitlements } from "@/src/context/ProjectEntitlementsProvider";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import type {
  ProjectModuleEntitlementDto,
  UpdateProjectModuleEntitlementsDto,
} from "@/src/contracts/project-entitlements.contract";
import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";

export default function ProjectModuleSettingsScreen() {
  const { projectName } = useProjectContext();
  const { session } = useSessionContext();
  const { show } = useToast();
  const { entitlements, loading, saving, error, save, refresh } = useProjectEntitlements();

  const [draft, setDraft] = useState<ProjectModuleEntitlementDto[]>([]);

  useEffect(() => {
    if (entitlements?.modules) {
      setDraft(entitlements.modules.map((module) => ({
        ...module,
        submodules: module.submodules.map((submodule) => ({ ...submodule })),
      })));
    }
  }, [entitlements]);

  const hasChanges = useMemo(() => {
    if (!entitlements) return false;
    return JSON.stringify(entitlements.modules) !== JSON.stringify(draft);
  }, [draft, entitlements]);

  if (session?.role !== "ADMIN") {
    return (
      <View className="gap-5">
        <PageHeader
          title="Project Settings"
          subTitle="Only admins can configure which modules and submodules are available for this project."
        />
        <Card className="border-shellLine bg-shellPanel">
          <CardContent className="py-6">
            <Text className="text-textMain text-base font-semibold">
              Access restricted
            </Text>
            <Text className="mt-2 text-muted">
              Ask an admin user to manage module availability for this project.
            </Text>
          </CardContent>
        </Card>
      </View>
    );
  }

  const handleToggleModule = (moduleKey: string) => {
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
  };

  const handleToggleSubmodule = (moduleKey: string, submoduleKey: string) => {
    setDraft((current) =>
      current.map((module) =>
        module.key !== moduleKey
          ? module
          : {
              ...module,
              submodules: module.submodules.map((submodule) =>
                submodule.key !== submoduleKey
                  ? submodule
                  : { ...submodule, enabled: !submodule.enabled },
              ),
            },
      ),
    );
  };

  const handleReset = () => {
    setDraft(
      entitlements?.modules.map((module) => ({
        ...module,
        submodules: module.submodules.map((submodule) => ({ ...submodule })),
      })) ?? [],
    );
  };

  const handleSave = async () => {
    const payload: UpdateProjectModuleEntitlementsDto = {
      modules: draft.map((module) => ({
        key: module.key,
        enabled: module.enabled,
        submodules: module.submodules.map((submodule) => ({
          key: submodule.key,
          enabled: submodule.enabled,
        })),
      })),
    };

    await save(payload);
    show("Project settings saved", "success");
  };

  return (
    <View className="gap-6">
      <PageHeader
        title="Project Settings"
        subTitle={`Control which modules and submodules are available inside ${projectName}.`}
        onRefresh={refresh}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onPress={handleReset}
              disabled={!hasChanges || saving}
              className="rounded-full"
            >
              Reset
            </Button>
            <Button
              variant="default"
              size="sm"
              onPress={handleSave}
              disabled={!hasChanges || saving}
              className="rounded-full"
              loading={saving}
            >
              Save changes
            </Button>
          </>
        }
      />

      <Card className="border-shellLine bg-shellPanel">
        <CardHeader className="gap-2">
          <Text className="text-[11px] uppercase tracking-[0.24em] text-muted">
            Module Access
          </Text>
          <CardTitle className="text-textMain text-xl">
            Availability by project
          </CardTitle>
          <CardDescription>
            This settings page controls what appears in the project sidebar and
            in vessel-level navigation. Core surfaces now follow the shared
            workspace shell, while accent is reserved for active decisions and
            save actions.
          </CardDescription>
        </CardHeader>
      </Card>

      {error ? (
        <Card className="border-destructive/25 bg-destructive/5">
          <CardContent className="py-5">
            <Text className="font-semibold text-destructive">
              Settings temporarily unavailable
            </Text>
            <Text className="mt-2 text-muted">{error}</Text>
          </CardContent>
        </Card>
      ) : null}

      {loading && draft.length === 0 ? (
        <Card className="border-shellLine bg-shellPanel">
          <CardContent className="py-6">
            <Text className="text-muted">Loading module settings...</Text>
          </CardContent>
        </Card>
      ) : null}

      <View className="gap-4">
        {draft.map((module) => (
          <Card key={module.key} className="border-shellLine bg-shellPanel">
            <CardHeaderRow className="items-start">
              <View className="min-w-[240px] flex-1 gap-2">
                <View className="flex-row items-center gap-3">
                  <View
                    className={[
                      "h-10 w-10 items-center justify-center rounded-2xl border",
                      module.enabled
                        ? "border-accent/35 bg-accent/10"
                        : "border-shellLine bg-shellPanelSoft",
                    ].join(" ")}
                  >
                    <Feather
                      name="layers"
                      size={18}
                      className={module.enabled ? "text-accent" : "text-muted"}
                    />
                  </View>

                  <View className="flex-1 gap-1">
                    <CardTitle className="text-textMain text-lg">
                      {module.label}
                    </CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </View>
                </View>
              </View>

              <SettingsToggle
                value={module.enabled}
                label={module.enabled ? "Enabled" : "Disabled"}
                onPress={() => handleToggleModule(module.key)}
              />
            </CardHeaderRow>

            <CardContent className="gap-3">
              <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4">
                <Text className="text-[11px] uppercase tracking-[0.22em] text-muted">
                  Submodules
                </Text>

                <View className="mt-4 gap-3">
                  {module.submodules.map((submodule) => (
                    <View
                      key={`${module.key}-${submodule.key}`}
                      className="flex-row items-center justify-between gap-4 rounded-2xl border border-shellLine bg-shellPanel px-4 py-3"
                    >
                      <View className="min-w-[240px] flex-1 gap-1">
                        <Text className="font-semibold text-textMain">
                          {submodule.label}
                        </Text>
                        <Text className="text-sm text-muted">
                          {submodule.description}
                        </Text>
                      </View>

                      <SettingsToggle
                        value={submodule.enabled}
                        label={submodule.enabled ? "Enabled" : "Disabled"}
                        onPress={() =>
                          handleToggleSubmodule(module.key, submodule.key)
                        }
                        disabled={!module.enabled}
                      />
                    </View>
                  ))}
                </View>
              </View>
            </CardContent>
          </Card>
        ))}
      </View>
    </View>
  );
}

function SettingsToggle({
  value,
  label,
  onPress,
  disabled = false,
}: {
  value: boolean;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      className={[
        "min-w-[124px] flex-row items-center justify-between rounded-full border px-3 py-2",
        value
          ? "border-accent/40 bg-accent/12"
          : "border-shellLine bg-shellPanelSoft",
        disabled ? "opacity-45" : "opacity-100",
      ].join(" ")}
    >
      <Text
        className={[
          "text-xs font-semibold uppercase tracking-[0.18em]",
          value ? "text-accent" : "text-muted",
        ].join(" ")}
      >
        {label}
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
