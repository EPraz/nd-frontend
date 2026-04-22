import { Text } from "@/src/components";
import React, { ReactNode } from "react";
import { TextInput, View } from "react-native";
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

  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-medium"
        style={{ color: LOGIN_PALETTE.navySoft }}
      >
        {label}
      </Text>
      <View
        className="h-14 flex-row items-center gap-3 rounded-[18px] border px-4"
        style={{
          borderColor: error ? "#f3b3b3" : LOGIN_PALETTE.cardLine,
          backgroundColor: LOGIN_PALETTE.card,
        }}
      >
        <View
          className="h-9 w-9 items-center justify-center rounded-xl border"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            borderColor: LOGIN_PALETTE.cardLine,
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
      </View>
      {error ? (
        <Text className="text-sm" style={{ color: "#c0392b" }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default AuthInput;
