import { Text } from "@/src/components/ui/text/Text";
import type { ReactNode } from "react";
import { View } from "react-native";

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

export function CertificateFormSection({ title, description, children }: Props) {
  return (
    <View className="gap-4 rounded-[24px] border border-shellLine bg-shellPanel p-5">
      <View className="gap-1">
        <Text className="text-[14px] font-semibold text-textMain">{title}</Text>
        <Text className="text-[12px] leading-[18px] text-muted">
          {description}
        </Text>
      </View>
      {children}
    </View>
  );
}
