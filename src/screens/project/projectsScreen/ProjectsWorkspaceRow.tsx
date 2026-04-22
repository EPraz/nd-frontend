import { Button } from "@/src/components/ui/button/Button";
import { Text } from "@/src/components/ui/text/Text";
import { ProjectDto } from "@/src/contracts/projects.contract";
import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";
import {
  formatWorkspaceDate,
  KIND_LABEL,
  KIND_SHORT_LABEL,
  statusTone,
} from "./projectsScreen.constants";

type ProjectsWorkspaceRowProps = {
  project: ProjectDto;
  index: number;
  onPress: () => void;
};

const ACTION_ICON_COLOR = "#ffd0a8";

export function ProjectsWorkspaceRow({
  project,
  index,
  onPress,
}: ProjectsWorkspaceRowProps) {
  const tone = statusTone(String(project.status));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={[
        "border-shellLine px-5 py-4 active:opacity-95 web:hover:bg-shellCardHover",
        index > 0 ? "border-t" : "",
      ].join(" ")}
    >
      <View className="hidden web:flex web:flex-row web:items-center web:gap-4">
        <View className="flex-[2.6] gap-1 pr-3">
          <Text className="text-[15px] font-semibold text-textMain">
            {project.name}
          </Text>
          <Text className="text-[12px] leading-[18px] text-muted">
            Open the workspace to continue into its active modules and current
            operational context.
          </Text>
        </View>

        <View className="flex-[1.1] pr-3">
          <View className="self-start rounded-full border border-shellLine bg-shellPanelSoft px-3 py-1">
            <Text className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              {KIND_SHORT_LABEL[project.kind]}
            </Text>
          </View>
        </View>

        <View className="flex-[1.05] pr-3">
          <View
            className={[
              "self-start flex-row items-center gap-2 rounded-full border px-3 py-1",
              tone.pill,
            ].join(" ")}
          >
            <View className={["h-2 w-2 rounded-full", tone.dot].join(" ")} />
            <Text
              className={[
                "text-[10px] font-semibold uppercase tracking-[0.16em]",
                tone.text,
              ].join(" ")}
            >
              {String(project.status)}
            </Text>
          </View>
        </View>

        <View className="flex-[1.2] pr-3">
          <Text className="text-[12px] text-muted">
            {formatWorkspaceDate(project.createdAt)}
          </Text>
        </View>

        <View className="flex-[1.5] pr-3">
          <Text className="text-[12px] leading-[18px] text-muted">
            {KIND_LABEL[project.kind]}
          </Text>
        </View>

        <View className="flex-[0.95] items-end">
          <Button
            variant="softAccent"
            size="pillXs"
            className="gap-2"
            onPress={onPress}
          >
            <Text className="text-accent">Enter</Text>
            <ChevronRight size={14} color={ACTION_ICON_COLOR} />
          </Button>
        </View>
      </View>

      <View className="gap-3 web:hidden">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-2">
            <View className="self-start rounded-full border border-shellLine bg-shellPanelSoft px-3 py-1">
              <Text className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                {KIND_SHORT_LABEL[project.kind]}
              </Text>
            </View>
            <Text className="text-[18px] font-semibold text-textMain">
              {project.name}
            </Text>
          </View>

          <View
            className={[
              "flex-row items-center gap-2 rounded-full border px-3 py-1",
              tone.pill,
            ].join(" ")}
          >
            <View className={["h-2 w-2 rounded-full", tone.dot].join(" ")} />
            <Text
              className={[
                "text-[10px] font-semibold uppercase tracking-[0.16em]",
                tone.text,
              ].join(" ")}
            >
              {String(project.status)}
            </Text>
          </View>
        </View>

        <Text className="text-[13px] leading-[20px] text-muted">
          {KIND_LABEL[project.kind]} opened {formatWorkspaceDate(project.createdAt)}.
        </Text>

        <View className="flex-row items-center justify-between border-t border-shellLine pt-3">
          <Text className="text-[12px] font-semibold uppercase tracking-[0.16em] text-shellHighlight">
            Enter workspace
          </Text>
          <ChevronRight size={16} color={ACTION_ICON_COLOR} />
        </View>
      </View>
    </Pressable>
  );
}
