import { Text } from "@/src/components";
import React, { ReactNode } from "react";
import { Pressable, TextInput, View } from "react-native";
import { LOGIN_PALETTE } from "./login.constants";

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
  rightAdornment?: ReactNode;
  onRightAdornmentPress?: () => void;
  rightAdornmentLabel?: string;
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
    rightAdornment,
    onRightAdornmentPress,
    rightAdornmentLabel,
  } = props;

  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-medium"
        style={{ color: LOGIN_PALETTE.navySoft }}
      >
        {label}
      </Text>
      <View
        className="h-16 flex-row items-center gap-3 rounded-[8px] border px-4"
        style={{
          borderColor: error ? LOGIN_PALETTE.dangerLine : LOGIN_PALETTE.cardLine,
          backgroundColor: LOGIN_PALETTE.card,
        }}
      >
        <View
          className="h-9 w-9 items-center justify-center rounded-xl"
          style={{
            backgroundColor: "rgba(255,255,255,0.015)",
          }}
        >
          {icon}
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={LOGIN_PALETTE.navyMute}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
          className="flex-1 text-base web:outline-none"
          style={{ color: LOGIN_PALETTE.navy }}
        />
        {rightAdornment ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightAdornmentLabel}
            onPress={onRightAdornmentPress}
            className="h-9 w-9 items-center justify-center rounded-xl"
          >
            {rightAdornment}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="text-[12px]" style={{ color: LOGIN_PALETTE.dangerText }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default AuthInput;
