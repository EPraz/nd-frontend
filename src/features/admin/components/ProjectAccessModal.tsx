import { Button } from "@/src/components/ui/button/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeaderRow,
  CardTitle,
} from "@/src/components/ui/card/Card";
import { Text } from "@/src/components/ui/text/Text";
import type {
  AdminProjectDto,
  AdminUserDto,
} from "@/src/contracts/admin.contract";
import { Feather } from "@expo/vector-icons";
import { Save } from "lucide-react-native";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { ROLE_LABEL } from "../admin.constants";
import { SelectRow } from "./AdminPrimitives";

const PRIMARY_ICON_COLOR = "#f8fafc";

type ProjectAccessModalProps = {
  project: AdminProjectDto | null;
  users: AdminUserDto[];
  selectedUserIds: string[];
  saving: boolean;
  onClose: () => void;
  onToggleUser: (userId: string) => void;
  onSave: () => void;
};

export function ProjectAccessModal({
  project,
  users,
  selectedUserIds,
  saving,
  onClose,
  onToggleUser,
  onSave,
}: ProjectAccessModalProps) {
  return (
    <Modal
      visible={Boolean(project)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center px-4">
        <Pressable className="absolute inset-0 bg-black/50" onPress={onClose} />

        <Card className="w-full max-w-[860px] overflow-hidden border-shellLine bg-shellPanel p-0">
          <CardHeaderRow className="border-b border-shellLine px-6 py-5">
            <View className="flex-1 gap-2">
              <Text className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Project access
              </Text>
              <CardTitle className="text-xl text-textMain">
                {project?.name ?? "Project"}
              </CardTitle>
              <CardDescription>
                Admin users still have company-wide visibility. Use explicit
                assignments here for operational and client-facing users.
              </CardDescription>
            </View>

            <Button
              variant="icon"
              size="icon"
              onPress={onClose}
              leftIcon={
                <Feather name="x" size={16} color="hsl(var(--text-main))" />
              }
            />
          </CardHeaderRow>

          <CardContent className="gap-5 py-6">
            <View className="rounded-[24px] border border-shellLine bg-shellPanelSoft p-4">
              <Text className="text-sm leading-6 text-muted">
                Select which users should appear as explicitly assigned to this
                project. This controls project visibility for non-admin users.
              </Text>
            </View>

            <ScrollView className="max-h-[380px]">
              <View className="gap-3">
                {users.length === 0 ? (
                  <Text className="text-sm text-muted">
                    Create users first before assigning project access.
                  </Text>
                ) : (
                  users.map((user) => (
                    <SelectRow
                      key={`access-${user.id}`}
                      title={user.name}
                      subtitle={`${user.email} - ${ROLE_LABEL[user.role]}`}
                      selected={selectedUserIds.includes(user.id)}
                      onPress={() => onToggleUser(user.id)}
                    />
                  ))
                )}
              </View>
            </ScrollView>

            <View className="flex-row justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onPress={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="rounded-full"
                onPress={onSave}
                loading={saving}
                rightIcon={<Save size={14} color={PRIMARY_ICON_COLOR} />}
              >
                Save access
              </Button>
            </View>
          </CardContent>
        </Card>
      </View>
    </Modal>
  );
}
