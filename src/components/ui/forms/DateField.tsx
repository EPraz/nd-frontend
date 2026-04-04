import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../text/Text";

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

function formatIsoDate(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string): Date {
  const normalized = value.trim();
  if (!normalized) return new Date();

  const [year, month, day] = normalized.split("-").map(Number);
  if (!year || !month || !day) return new Date();

  return new Date(year, month - 1, day);
}

export function DateField({
  label,
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
}: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const selectedDate = useMemo(() => parseIsoDate(value), [value]);

  function handleNativeChange(
    event: DateTimePickerEvent,
    nextDate?: Date,
  ) {
    if (Platform.OS !== "ios") {
      setShowPicker(false);
    }

    if (event.type === "dismissed") return;
    if (!nextDate) return;

    onChange(formatIsoDate(nextDate));
  }

  if (Platform.OS === "web") {
    return (
      <View className="gap-2">
        <Text className="text-textMain/80 text-sm font-medium">{label}</Text>
        <input
          type="date"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.currentTarget.value)}
          style={{
            height: 48,
            width: "100%",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(15, 23, 42, 0.4)",
            color: "#dde6ed",
            padding: "0 16px",
            outline: "none",
            colorScheme: "dark",
          }}
        />
      </View>
    );
  }

  return (
    <View className="gap-2">
      <Text className="text-textMain/80 text-sm font-medium">{label}</Text>

      <Pressable
        onPress={() => setShowPicker(true)}
        disabled={disabled}
        className={[
          "h-12 rounded-2xl border border-white/15 bg-baseBg/40 px-4 justify-center",
          disabled ? "opacity-60" : "",
        ].join(" ")}
      >
        <View className="flex-row items-center justify-between gap-3">
          <Text className={value ? "text-textMain" : "text-textMain/40"}>
            {value || placeholder}
          </Text>
          <Ionicons name="calendar-outline" size={16} color="#ffffff" />
        </View>
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleNativeChange}
        />
      ) : null}
    </View>
  );
}
