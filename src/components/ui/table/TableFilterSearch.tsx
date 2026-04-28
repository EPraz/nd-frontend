import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";

type TableFilterSearchProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  minWidth?: number;
};

export function TableFilterSearch({
  value,
  onChangeText,
  placeholder,
  open,
  onOpenChange,
  minWidth = 280,
}: TableFilterSearchProps) {
  const expanded = open || Boolean(value);

  return (
    <View
      className={[
        "flex-row items-center overflow-hidden rounded-full border border-shellLine bg-shellPanel",
        expanded ? "" : "w-11",
      ].join(" ")}
      style={expanded ? { minWidth } : undefined}
    >
      <Pressable
        onPress={() => {
          if (expanded && !value) {
            onOpenChange(false);
            return;
          }
          onOpenChange(true);
        }}
        className="h-11 w-11 items-center justify-center"
      >
        <Ionicons
          name="search-outline"
          size={18}
          color="rgba(221,230,237,0.95)"
        />
      </Pressable>

      {expanded ? (
        <View className="flex-1 flex-row items-center pr-2">
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="rgba(221,230,237,0.35)"
            className="h-11 flex-1 text-textMain outline-none"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            onPress={() => {
              onChangeText("");
              onOpenChange(false);
            }}
            className="h-9 w-9 items-center justify-center"
          >
            <Ionicons
              name="close"
              size={16}
              color="rgba(221,230,237,0.75)"
            />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
