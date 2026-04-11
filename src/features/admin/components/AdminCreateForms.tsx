import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Text,
} from "@/src/components";
import type { AdminProjectDto, UserRole } from "@/src/contracts/admin.contract";
import type { ProjectKind } from "@/src/contracts/projects.contract";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import {
  KIND_LABEL,
  PROJECT_KIND_OPTIONS,
  ROLE_LABEL,
  USER_ROLE_OPTIONS,
} from "../admin.constants";
import { ChoicePill, SelectRow } from "./AdminPrimitives";

export type CreateProjectFormValues = {
  name: string;
  kind: ProjectKind;
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
      defaultValues: { name: "", kind: "MARITIME" },
    });
  const projectKind = watch("kind");

  const submit = handleSubmit(
    async (values) => {
      const saved = await onSubmit({
        name: values.name.trim(),
        kind: values.kind,
      });

      if (saved) reset({ name: "", kind: "MARITIME" });
    },
    onInvalid,
  );

  return (
    <Card className="border-shellLine bg-shellPanel">
      <CardHeader className="gap-2">
        <CardTitle className="text-lg text-textMain">Create project</CardTitle>
        <CardDescription>
          Add a workspace first, then tune modules from the project settings.
        </CardDescription>
      </CardHeader>

      <CardContent className="gap-5">
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
            />
          )}
        />

        <View className="gap-2">
          <Text className="text-sm font-medium text-muted">Project kind</Text>
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
        </View>

        <Button
          variant="default"
          size="sm"
          className="self-start rounded-full"
          onPress={submit}
          loading={saving}
        >
          Create project
        </Button>
      </CardContent>
    </Card>
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

  const toggleProject = (projectId: string) => {
    setValue(
      "projectIds",
      projectIds.includes(projectId)
        ? projectIds.filter((value) => value !== projectId)
        : [...projectIds, projectId],
      { shouldDirty: true, shouldTouch: true },
    );
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
    <Card className="border-shellLine bg-shellPanel">
      <CardHeader className="gap-2">
        <CardTitle className="text-lg text-textMain">Create user</CardTitle>
        <CardDescription>
          Create a client-facing user and assign project access in one pass.
        </CardDescription>
      </CardHeader>

      <CardContent className="gap-5">
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

        <View className="gap-3 rounded-[24px] border border-shellLine bg-shellPanelSoft p-4">
          <View className="gap-1">
            <Text className="text-sm font-semibold text-textMain">
              Initial project access
            </Text>
            <Text className="text-sm text-muted">
              Optional now. You can still adjust access later from the project
              table.
            </Text>
          </View>

          {projects.length === 0 ? (
            <Text className="text-sm text-muted">
              Create a project first to assign access here.
            </Text>
          ) : (
            <View className="gap-2">
              {projects.map((project) => (
                <SelectRow
                  key={`create-user-${project.id}`}
                  title={project.name}
                  subtitle={KIND_LABEL[project.kind]}
                  selected={projectIds.includes(project.id)}
                  onPress={() => toggleProject(project.id)}
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
        >
          Create user
        </Button>
      </CardContent>
    </Card>
  );
}
