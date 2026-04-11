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
        className="h-12 rounded-[20px] border border-shellLine bg-shellPanelSoft px-4 text-textMain web:backdrop-blur-md focus:border-accent"
        secureTextEntry={secureTextEntry}
        multiline={multiline}
      />
    </View>
  );
}
