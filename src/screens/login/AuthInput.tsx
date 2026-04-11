import { Text } from "@/src/components";
import { usePlaceholderColor } from "@/src/lib/utils";
import React, { ReactNode } from "react";
import { TextInput, View } from "react-native";

const AuthInput = (props: {
  label: string;
  icon: ReactNode;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
}) => {
  const {
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "none",
    error,
  } = props;
  const placeholderColor = usePlaceholderColor();

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-authCopyMuted">{label}</Text>
      <View
        className={[
          "h-14 flex-row items-center gap-3 rounded-[22px] border px-4",
          error
            ? "border-destructive/70 bg-destructive/8"
            : "border-authLine bg-authField",
        ].join(" ")}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-authSoft">
          {icon}
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
          className="flex-1 text-base text-authCopy web:outline-none"
        />
      </View>
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
    </View>
  );
};

export default AuthInput;
