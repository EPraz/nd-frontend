import { Portal } from "@rn-primitives/portal";
import { BlurView } from "expo-blur";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "../ui";

type Props = {
  portalName: string;
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
  scroll?: boolean;
};

export default function QuickViewModalFrame({
  portalName,
  open,
  onClose,
  eyebrow,
  title,
  subtitle,
  headerActions,
  children,
  footer,
  maxWidth = 980,
  scroll = true,
}: Props) {
  if (!open) return null;

  const content = (
    <View className="gap-3">
      <View className="gap-2 border-b border-shellLine pb-2">
        <View className="items-start gap-2 web:flex-row web:items-start web:justify-between">
          <View className="min-w-0 flex-1 gap-1">
            {eyebrow ? (
              <Text className="text-[11px] uppercase tracking-[0.24em] text-accent">
                {eyebrow}
              </Text>
            ) : null}

            <Text className="text-[16px] font-semibold text-textMain">
              {title}
            </Text>

            {subtitle ? (
              <Text className="max-w-2xl text-[12px] leading-[16px] text-muted">
                {subtitle}
              </Text>
            ) : null}
          </View>

          {headerActions ? (
            <View className="flex-row items-center gap-2">{headerActions}</View>
          ) : null}
        </View>
      </View>

      <View className="gap-3">{children}</View>

      {footer ? (
        <View className="flex-row justify-end gap-2 border-t border-shellLine pt-2">
          {footer}
        </View>
      ) : null}
    </View>
  );

  return (
    <Portal name={portalName}>
      <View
        className="absolute inset-0 z-50"
        style={{ pointerEvents: "box-none" }}
      >
        <Pressable onPress={onClose} className="absolute inset-0">
          <BlurView intensity={20} tint="dark" className="absolute inset-0" />
          <View className="absolute inset-0 bg-black/45" />
        </Pressable>

        <View className="flex-1 items-center justify-center p-2 web:p-3">
          <View
            style={{ maxWidth, maxHeight: "90%" }}
            className={[
              "min-h-0 w-full rounded-[24px] border p-4",
              "bg-shellPanel border-shellLine web:backdrop-blur-md",
              "shadow-[0_20px_80px_rgba(0,0,0,0.55)]",
            ].join(" ")}
          >
            {scroll ? (
              <ScrollView
                className="min-h-0"
                style={{ maxHeight: "100%" }}
                showsVerticalScrollIndicator={false}
                contentContainerClassName="gap-3"
              >
                {content}
              </ScrollView>
            ) : (
              content
            )}
          </View>
        </View>
      </View>
    </Portal>
  );
}
