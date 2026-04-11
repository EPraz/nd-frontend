import { Text } from "@/src/components";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";

type Props = {
  label?: string;
  placeholder?: string;
  vessels: AssetDto[];
  value: AssetDto | null;
  onChange: (v: AssetDto) => void;
  disabled?: boolean;
};

function norm(s: string) {
  return s.trim().toLowerCase();
}

function vesselMeta(v: AssetDto): { primary: string; secondary: string } {
  const flag = v.vessel?.flag ? `Flag: ${v.vessel.flag}` : null;

  const isIMO = v.vessel?.identifierType === "IMO";
  const imo = v.vessel?.imo ? `IMO: ${v.vessel.imo}` : null;

  const isLic = v.vessel?.identifierType === "LICENSE";
  const lic = v.vessel?.licenseNumber ? `LIC: ${v.vessel.licenseNumber}` : null;

  const primary = (isIMO && imo) || (isLic && lic) || (imo ?? lic ?? "Vessel");
  const secondary = [flag].filter(Boolean).join(" - ");

  return { primary, secondary };
}

function scoreVessel(v: AssetDto, query: string): number {
  if (!query) return 0;
  const q = norm(query);

  const name = norm(v.name);
  const imo = norm(v.vessel?.imo ?? "");
  const lic = norm(v.vessel?.licenseNumber ?? "");
  const flag = norm(v.vessel?.flag ?? "");
  const fields = [name, imo, lic, flag];

  // Prefix matches should rank higher than loose matches.
  if (fields.some((f) => f.startsWith(q))) return 3;
  if (fields.some((f) => f.includes(q))) return 2;

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length && tokens.every((t) => fields.some((f) => f.includes(t)))) {
    return 1;
  }

  return -1;
}

export function SearchableVesselSelect({
  label = "Vessel *",
  placeholder = "Select a vessel...",
  vessels,
  value,
  onChange,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim();

    return vessels
      .filter((v) => v.type === "VESSEL")
      .map((v) => ({ v, s: scoreVessel(v, query) }))
      .filter((x) => (query ? x.s >= 0 : true))
      .sort((a, b) => b.s - a.s || a.v.name.localeCompare(b.v.name))
      .map((x) => x.v);
  }, [q, vessels]);

  function close() {
    setOpen(false);
    setQ("");
  }

  const selectedLabel = value ? value.name : placeholder;

  return (
    <View className="gap-2">
      <Text className="text-[13px] text-muted">{label}</Text>

      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={[
          "h-12 flex-row items-center justify-between rounded-2xl border border-shellLine bg-shellGlass px-4 web:backdrop-blur-md",
          disabled ? "opacity-50" : "active:opacity-90",
        ].join(" ")}
      >
        <Text className={value ? "text-textMain" : "text-muted"}>
          {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={18} color="rgba(221,230,237,0.9)" />
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={close}
      >
        <Pressable onPress={close} className="flex-1 bg-black/60">
          <Pressable
            onPress={() => {}}
            className="mx-4 mt-24 rounded-3xl border border-shellLine bg-shellPanel p-4 web:mx-auto web:w-[560px] web:backdrop-blur-md"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-[16px] font-semibold text-textMain">
                Select vessel
              </Text>
              <Pressable onPress={close} className="p-2 active:opacity-80">
                <Ionicons
                  name="close"
                  size={20}
                  color="rgba(221,230,237,0.9)"
                />
              </Pressable>
            </View>

            <View className="mt-3 flex-row items-center gap-2 rounded-2xl border border-shellLine bg-shellPanelSoft px-3">
              <Ionicons
                name="search"
                size={16}
                color="rgba(221,230,237,0.65)"
              />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search by name, IMO, license, flag..."
                placeholderTextColor="rgba(221,230,237,0.35)"
                className="h-11 flex-1 text-textMain"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <ScrollView
              className="mt-3 max-h-[360px]"
              showsVerticalScrollIndicator={false}
            >
              {filtered.length === 0 ? (
                <View className="items-center py-8">
                  <Text className="text-muted">No vessels found.</Text>
                </View>
              ) : (
                <View className="gap-2">
                  {filtered.map((v) => {
                    const active = value?.id === v.id;
                    const meta = vesselMeta(v);

                    return (
                      <Pressable
                        key={v.id}
                        onPress={() => {
                          onChange(v);
                          close();
                        }}
                        className={[
                          "rounded-2xl border px-4 py-3",
                          active
                            ? "border-accent bg-accent/10"
                            : "border-shellLine bg-shellPanelSoft active:opacity-90",
                        ].join(" ")}
                      >
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1">
                            <Text className="font-semibold text-textMain">
                              {v.name}
                            </Text>
                            <Text className="mt-1 text-[12px] text-muted">
                              {meta.primary}
                              {meta.secondary ? ` - ${meta.secondary}` : ""}
                            </Text>
                          </View>

                          {active ? (
                            <View className="h-7 w-7 items-center justify-center rounded-full bg-accent">
                              <Ionicons
                                name="checkmark"
                                size={18}
                                color="#0b0b0b"
                              />
                            </View>
                          ) : (
                            <Ionicons
                              name="chevron-forward"
                              size={16}
                              color="rgba(221,230,237,0.55)"
                            />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
