import { ColorValue, TextInput, TextInputProps, View } from "react-native";
import { Text } from "../text/Text";

type FieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (v: string) => void;
  editable?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  secureTextEntry?: boolean;
  placeholderTextColor?: ColorValue;
  multiline?: boolean;
  error?: string | null;
  hint?: string | null;
};

export function Field({
  label,
  placeholder,
  value,
  onChangeText,
  editable = true,
  keyboardType,
  autoCapitalize,
  secureTextEntry = false,
  placeholderTextColor,
  multiline,
  error,
  hint,
}: FieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-muted">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "none"}
        editable={editable}
        className={[
          "rounded-[20px] bg-shellPanelSoft px-4 text-textMain web:backdrop-blur-md focus:border-accent",
          multiline ? "min-h-[120px] py-3" : "h-12",
          error ? "border border-destructive" : "border border-shellLine",
        ].join(" ")}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {error ? (
        <Text className="text-[12px] leading-[18px] text-destructive">
          {error}
        </Text>
      ) : hint ? (
        <Text className="text-[12px] leading-[18px] text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}
