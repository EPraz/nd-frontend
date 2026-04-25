import { Button } from "@/src/components/ui/button/Button";
import { Field } from "@/src/components/ui/forms/Field";
import { PopoverMultiSelect } from "@/src/components/ui/forms/PopoverMultiSelect";
import { Text } from "@/src/components/ui/text/Text";
import { PROJECT_MODULE_CATALOG } from "@/src/constants/projectModules";
import type { AdminProjectDto, UserRole } from "@/src/contracts/admin.contract";
import type { ProjectKind } from "@/src/contracts/projects.contract";
import { Plus } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import {
  KIND_LABEL,
  PROJECT_KIND_OPTIONS,
  ROLE_LABEL,
  USER_ROLE_OPTIONS,
} from "../admin.constants";
import { ChoicePill } from "./AdminPrimitives";

const PRIMARY_ICON_COLOR = "#f8fafc";
const DEFAULT_MODULE_KEYS = PROJECT_MODULE_CATALOG.filter(
  (module) => module.defaultEnabled,
).map((module) => module.key);

export type CreateProjectFormValues = {
  name: string;
  kind: ProjectKind;
  enabledModuleKeys: string[];
};

export type CreateUserFormValues = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  projectIds: string[];
};

export function CreateProjectPanel({
  saving,
  onSubmit,
  onInvalid,
}: {
  saving: boolean;
  onSubmit: (values: CreateProjectFormValues) => Promise<boolean>;
  onInvalid: () => void;
}) {
  const { control, handleSubmit, reset, setValue, watch } =
    useForm<CreateProjectFormValues>({
      defaultValues: {
        name: "",
        kind: "MARITIME",
        enabledModuleKeys: DEFAULT_MODULE_KEYS,
      },
    });
  const projectKind = watch("kind");
  const enabledModuleKeys = watch("enabledModuleKeys");

  const toggleModule = (moduleKey: string) => {
    setValue(
      "enabledModuleKeys",
      toggleListValue(enabledModuleKeys, moduleKey),
      { shouldDirty: true, shouldTouch: true },
    );
  };

  const submit = handleSubmit(
    async (values) => {
      const saved = await onSubmit({
        name: values.name.trim(),
        kind: values.kind,
        enabledModuleKeys: values.enabledModuleKeys,
      });

      if (saved) {
        reset({
          name: "",
          kind: "MARITIME",
          enabledModuleKeys: DEFAULT_MODULE_KEYS,
        });
      }
    },
    onInvalid,
  );

  return (
    <SetupSurface
      eyebrow="Workspace setup"
      title="Create project"
      description="Create the workspace and choose the module baseline it should launch with."
    >
      <View className="gap-5 p-5">
        <View className="gap-5 web:lg:flex-row web:lg:items-end">
          <View className="flex-1">
            <Controller
              control={control}
              name="name"
              rules={{ validate: (value) => value.trim().length > 0 }}
              render={({ field }) => (
                <Field
                  label="Project name"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Example: Pacific Fleet Expansion"
                  autoCapitalize="words"
                  placeholderTextColor="#9AA7B8"
                  surfaceTone="raised"
                />
              )}
            />
          </View>

          <View className="gap-2 web:lg:w-[220px]">
            <Text className="text-sm font-medium text-muted">Project kind</Text>
            {PROJECT_KIND_OPTIONS.length === 1 ? (
              <View className="self-start rounded-full border border-accent/35 bg-accent/12 px-4 py-2.5">
                <Text className="text-sm font-semibold text-accent">
                  {KIND_LABEL[projectKind]}
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {PROJECT_KIND_OPTIONS.map((option) => (
                  <ChoicePill
                    key={option}
                    label={KIND_LABEL[option]}
                    active={projectKind === option}
                    onPress={() => setValue("kind", option)}
                  />
                ))}
              </View>
            )}
          </View>

          <Button
            variant="default"
            size="sm"
            className="self-start rounded-full"
            onPress={submit}
            loading={saving}
            rightIcon={<Plus size={14} color={PRIMARY_ICON_COLOR} />}
          >
            Create project
          </Button>
        </View>

        <ModuleBaselinePicker
          enabledModuleKeys={enabledModuleKeys}
          onToggleModule={toggleModule}
        />
      </View>
    </SetupSurface>
  );
}

export function CreateUserPanel({
  projects,
  saving,
  onSubmit,
  onInvalid,
}: {
  projects: AdminProjectDto[];
  saving: boolean;
  onSubmit: (values: CreateUserFormValues) => Promise<boolean>;
  onInvalid: () => void;
}) {
  const { control, handleSubmit, reset, setValue, watch } =
    useForm<CreateUserFormValues>({
      defaultValues: {
        name: "",
        email: "",
        password: "",
        role: "OPS",
        projectIds: [],
      },
    });
  const role = watch("role");
  const projectIds = watch("projectIds");

  const setProjectAccess = (nextProjectIds: string[]) => {
    setValue("projectIds", nextProjectIds, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const submit = handleSubmit(
    async (values) => {
      const saved = await onSubmit({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
        projectIds: values.projectIds,
      });

      if (saved) {
        reset({
          name: "",
          email: "",
          password: "",
          role: "OPS",
          projectIds: [],
        });
      }
    },
    onInvalid,
  );

  return (
    <SetupSurface
      eyebrow="Identity setup"
      title="Create user"
      description="Create a client-facing identity and assign project access in one pass."
    >
      <View className="gap-5 p-5 web:lg:flex-row web:lg:items-start">
        <View className="flex-1 gap-5">
          <Controller
            control={control}
            name="name"
            rules={{ validate: (value) => value.trim().length > 0 }}
            render={({ field }) => (
              <Field
                label="Full name"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Example: Juan Perez"
                autoCapitalize="words"
                placeholderTextColor="#9AA7B8"
                surfaceTone="raised"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{ validate: (value) => value.trim().length > 0 }}
            render={({ field }) => (
              <Field
                label="Email"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="juan.perez@client.test"
                keyboardType="email-address"
                placeholderTextColor="#9AA7B8"
                surfaceTone="raised"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{ validate: (value) => value.trim().length > 0 }}
            render={({ field }) => (
              <Field
                label="Password"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Use a clear but strong password"
                secureTextEntry
                placeholderTextColor="#9AA7B8"
                surfaceTone="raised"
              />
            )}
          />

          <View className="gap-2">
            <Text className="text-sm font-medium text-muted">Role</Text>
            <View className="flex-row flex-wrap gap-2">
              {USER_ROLE_OPTIONS.map((option) => (
                <ChoicePill
                  key={option}
                  label={ROLE_LABEL[option]}
                  active={role === option}
                  onPress={() => setValue("role", option)}
                />
              ))}
            </View>
          </View>

          <Button
            variant="default"
            size="sm"
            className="self-start rounded-full"
            onPress={submit}
            loading={saving}
            rightIcon={<Plus size={14} color={PRIMARY_ICON_COLOR} />}
          >
            Create user
          </Button>
        </View>

        <ProjectAccessPicker
          projects={projects}
          selectedProjectIds={projectIds}
          onChange={setProjectAccess}
        />
      </View>
    </SetupSurface>
  );
}

function SetupSurface({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View className="overflow-hidden rounded-[28px] border border-shellLine bg-shellPanel">
      <View className="gap-2 border-b border-shellLine px-5 py-5">
        <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-shellHighlight">
          {eyebrow}
        </Text>
        <Text className="text-[22px] font-semibold tracking-tight text-textMain">
          {title}
        </Text>
        <Text className="max-w-[720px] text-[13px] leading-6 text-muted">
          {description}
        </Text>
      </View>

      {children}
    </View>
  );
}

function ModuleBaselinePicker({
  enabledModuleKeys,
  onToggleModule,
}: {
  enabledModuleKeys: string[];
  onToggleModule: (moduleKey: string) => void;
}) {
  const enabledCount = enabledModuleKeys.length;

  return (
    <View className="gap-4 rounded-[24px] border border-shellLine bg-shellCanvas p-4">
      <View className="gap-3 web:flex-row web:items-start web:justify-between">
        <View className="gap-1">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-shellHighlight">
            Module baseline
          </Text>
          <Text className="max-w-[720px] text-sm leading-6 text-muted">
            Choose the launch modules before the workspace is created.
          </Text>
        </View>

        <View className="self-start rounded-full border border-shellLine bg-shellPanelSoft px-3 py-1.5">
          <Text className="text-[12px] font-semibold text-textMain">
            {enabledCount} of {PROJECT_MODULE_CATALOG.length} enabled
          </Text>
        </View>
      </View>

      <View className="gap-2 web:grid web:grid-cols-2 2xl:grid-cols-5">
        {PROJECT_MODULE_CATALOG.map((module) => {
          const selected = enabledModuleKeys.includes(module.key);

          return (
            <Pressable
              key={module.key}
              accessibilityRole="switch"
              accessibilityState={{ checked: selected }}
              onPress={() => onToggleModule(module.key)}
              className={[
                "min-h-[76px] flex-row items-center gap-3 rounded-[18px] border px-4 py-3",
                selected
                  ? "border-accent/35 bg-accent/10"
                  : "border-shellLine bg-shellPanelSoft",
              ].join(" ")}
            >
              <View
                className={[
                  "h-2.5 w-2.5 rounded-full",
                  selected ? "bg-accent" : "bg-muted",
                ].join(" ")}
              />
              <View className="min-w-0 flex-1 gap-0.5">
                <Text className="text-sm font-semibold text-textMain">
                  {module.label}
                </Text>
                <Text className="text-[12px] leading-5 text-muted">
                  {module.defaultEnabled ? "Recommended baseline" : "Optional module"}
                </Text>
              </View>

              <ToggleVisual selected={selected} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ProjectAccessPicker({
  projects,
  selectedProjectIds,
  onChange,
}: {
  projects: AdminProjectDto[];
  selectedProjectIds: string[];
  onChange: (projectIds: string[]) => void;
}) {
  const selectedProjects = projects.filter((project) =>
    selectedProjectIds.includes(project.id),
  );
  const selectLabel = getProjectAccessSelectLabel(selectedProjects);
  const options = projects.map((project) => ({
    value: project.id,
    label: project.name,
    description: KIND_LABEL[project.kind],
    accessibilityLabel: `${project.name} ${KIND_LABEL[project.kind]}`,
  }));

  return (
    <View className="gap-4 rounded-[24px] border border-shellLine bg-shellCanvas p-4 web:lg:w-[430px]">
      <View className="gap-1">
        <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-shellHighlight">
          Initial access
        </Text>
        <Text className="text-sm leading-6 text-muted">
          Optional now. You can still adjust access later from the project
          directory.
        </Text>
      </View>

      {projects.length === 0 ? (
        <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-3">
          <Text className="text-sm text-muted">
            Create a project first to assign access here.
          </Text>
        </View>
      ) : (
        <PopoverMultiSelect
          label="Project access"
          value={selectedProjectIds}
          options={options}
          onChange={onChange}
          placeholder="No projects selected"
          selectedLabel={selectLabel}
          emptyMessage="Create a project first to assign access here."
          minWidth={360}
          maxWidth={460}
        />
      )}
    </View>
  );
}

function ToggleVisual({ selected }: { selected: boolean }) {
  return (
    <View
      className={[
        "h-6 w-11 rounded-full px-1",
        selected ? "bg-accent/25" : "bg-shellSoft",
      ].join(" ")}
    >
      <View
        className={[
          "mt-1 h-4 w-4 rounded-full",
          selected ? "ml-auto bg-accent" : "ml-0 bg-shellLine",
        ].join(" ")}
      />
    </View>
  );
}

function getProjectAccessSelectLabel(projects: AdminProjectDto[]) {
  if (projects.length === 0) {
    return "No projects selected";
  }

  if (projects.length === 1) {
    return projects[0].name;
  }

  return `${projects.length} projects selected`;
}

function toggleListValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}
