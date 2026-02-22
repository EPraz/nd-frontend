import { ColorValue, TextInput, TextInputProps, View } from "react-native";
import { Text } from "../text/Text";

type FieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  secureTextEntry?: boolean;
  placeholderTextColor?: ColorValue;
  multiline?: boolean;
};

export function Field({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  secureTextEntry = false,
  placeholderTextColor,
  multiline,
}: FieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-textMain/80 text-sm font-medium">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "none"}
        className="h-12 rounded-2xl bg-baseBg/40 border border-white/15 px-4 text-textMain  focus:border-accent"
        // OK en dark; si quieres perfecto cross-theme, luego lo llevamos a helper
        secureTextEntry={secureTextEntry}
        multiline={multiline}
      />
    </View>
  );
}
