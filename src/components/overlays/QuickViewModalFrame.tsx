import { Portal } from "@rn-primitives/portal";
import { BlurView } from "expo-blur";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "../ui";

type Props = {
  /** nombre del portal (único por modal) */
  portalName: string;

  /** control */
  open: boolean;
  onClose: () => void;

  /** header */
  title: string;
  subtitle?: string;

  /** right side actions in header (icon buttons, delete/edit/close, etc.) */
  headerActions?: React.ReactNode;

  /** main content */
  children: React.ReactNode;

  /** footer actions (Close / Open Full Page, etc.) */
  footer?: React.ReactNode;

  /** layout */
  maxWidth?: number; // default 980
  scroll?: boolean; // default true
};

export default function QuickViewModalFrame({
  portalName,
  open,
  onClose,
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
    <View className="gap-5">
      {/* Header */}
      <View className="web:flex-row web:items-start web:justify-between items-start gap-3">
        <View className="gap-1">
          <Text className="text-textMain text-[18px] font-semibold">
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-muted text-[13px] leading-[18px]">
              {subtitle}
            </Text>
          ) : null}
        </View>

        {headerActions ? (
          <View className="flex-row items-center gap-3">{headerActions}</View>
        ) : null}
      </View>

      {/* Body */}
      <View className="gap-5">{children}</View>

      {/* Footer */}
      {footer ? (
        <View className="flex-row justify-end gap-3">{footer}</View>
      ) : null}
    </View>
  );

  return (
    <Portal name={portalName}>
      <View className="absolute inset-0 z-50" pointerEvents="box-none">
        {/* Backdrop */}
        <Pressable onPress={onClose} className="absolute inset-0">
          <BlurView intensity={20} tint="dark" className="absolute inset-0" />
          <View className="absolute inset-0 bg-black/45" />
        </Pressable>

        {/* Modal Container */}
        <View className="flex-1 items-center justify-center p-4 web:p-6">
          <View
            pointerEvents="auto"
            style={{ maxWidth }}
            className={[
              "w-full rounded-[26px] border p-5",
              "bg-surface border-border",
              // shadow web + native friendly
              "shadow-[0_20px_80px_rgba(0,0,0,0.55)]",
            ].join(" ")}
          >
            {scroll ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="gap-5"
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
