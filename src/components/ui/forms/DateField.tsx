import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useMemo, useRef, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../text/Text";

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  surfaceTone?: "default" | "raised";
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
  surfaceTone = "default",
}: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const webInputRef = useRef<HTMLInputElement | null>(null);

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

  function openWebPicker() {
    if (disabled) return;

    const input = webInputRef.current;
    if (!input) return;

    input.focus();

    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }
    } catch {
      // Fall back to click for browsers without showPicker support.
    }

    input.click();
  }

  if (Platform.OS === "web") {
    return (
      <View className="gap-2">
        <Text className="text-sm font-medium text-muted">{label}</Text>
        <Pressable
          onPress={openWebPicker}
          disabled={disabled}
          className={[
            [
              "relative h-12 justify-center rounded-[20px] border border-shellLine px-4",
              surfaceTone === "raised" ? "bg-shellCanvas" : "bg-shellPanelSoft",
            ].join(" "),
            disabled ? "opacity-60" : "",
          ].join(" ")}
        >
          <View className="flex-row items-center justify-between gap-3">
            <Text className={value ? "text-textMain" : "text-muted"}>
              {value || placeholder}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={16}
              className="text-muted"
            />
          </View>

          <input
            ref={webInputRef}
            type="date"
            aria-label={label}
            value={value}
            disabled={disabled}
            tabIndex={-1}
            onChange={(event) => onChange(event.currentTarget.value)}
            style={{
              position: "absolute",
              inset: 0,
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: "none",
            }}
          />
        </Pressable>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-muted">{label}</Text>

      <Pressable
        onPress={() => setShowPicker(true)}
        disabled={disabled}
        className={[
          [
            "h-12 justify-center rounded-[20px] border border-shellLine px-4",
            surfaceTone === "raised" ? "bg-shellCanvas" : "bg-shellPanelSoft",
          ].join(" "),
          disabled ? "opacity-60" : "",
        ].join(" ")}
      >
        <View className="flex-row items-center justify-between gap-3">
          <Text className={value ? "text-textMain" : "text-muted"}>
            {value || placeholder}
          </Text>
          <Ionicons
            name="calendar-outline"
            size={16}
            color="hsl(var(--muted))"
          />
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
