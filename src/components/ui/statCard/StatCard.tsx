import type { iconLib } from "@/src/constants";
import { iconLibMap } from "@/src/constants";
import { useTheme } from "@/src/context/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

const cx = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(" ");

type StatCardProps = {
  iconName: string;
  iconLib: iconLib;
  title: string;
  value?: string;
  suffix?: string;
  badgeValue?: string;
  badgeColor?: "success" | "fail";
  badgeLabel?: string;
  special?: boolean;
  loading?: boolean;
};

const lightSpecialGradient = [
  "hsl(214 44% 94%)",
  "hsl(214 40% 90%)",
  "hsl(24 95% 60%)",
] as const;

const darkSpecialGradient = [
  "hsl(223 34% 18%)",
  "hsl(222 28% 20%)",
  "hsl(24 95% 60%)",
] as const;

const StatCard = ({
  iconName,
  iconLib = "ion",
  title,
  value,
  suffix,
  badgeValue,
  badgeColor,
  badgeLabel,
  special = false,
  loading,
}: StatCardProps) => {
  const Icon = iconLibMap[iconLib];
  const { theme } = useTheme();

  const isLoading = Boolean(loading);
  const isPositive = badgeColor === "success";

  const cardMinWidth = 312;
  const cardMinHeight = 170;

  const titleText = "text-textMain";
  const subText = "text-muted";
  const badgeBg = isPositive
    ? "border-success/35 bg-success/20"
    : "border-destructive/35 bg-destructive/20";
  const badgeText = isPositive ? "text-success" : "text-destructive";
  const specialGradientColors =
    theme === "light" ? lightSpecialGradient : darkSpecialGradient;
  const specialBorderColor =
    theme === "light"
      ? "hsla(214, 28%, 78%, 0.85)"
      : "hsla(218, 24%, 35%, 0.95)";

  const renderBadge = () => (
    <View className="flex-row items-center gap-2">
      <View
        className={cx(
          "flex-row items-center gap-1 rounded-full border px-2 py-1",
          badgeBg,
        )}
      >
        <Ionicons
          name={isPositive ? "trending-up" : "trending-down"}
          size={15}
          className={badgeText}
        />
        <Text className={cx("text-[12px] font-semibold", badgeText)}>
          {badgeValue}
        </Text>
      </View>

      <Text className={cx("text-[14px] leading-[130%]", subText)}>
        {badgeLabel}
      </Text>
    </View>
  );

  const content = (
    <View className="gap-4">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full border border-shellBadgeBorder bg-shellBadge web:backdrop-blur-md">
          <Icon
            name={iconName as any}
            size={22}
            className={isLoading ? "text-muted" : "text-shellHighlight"}
          />
        </View>

        <Text
          className={cx("text-[18px] leading-[130%] font-semibold", titleText)}
        >
          {title}
        </Text>
      </View>

      <View className="flex-row items-end gap-2">
        <Text
          className={cx("text-[40px] font-semibold leading-[120%]", titleText)}
        >
          {isLoading ? "-" : value}
        </Text>

        {suffix ? (
          <Text className={cx("mb-1 text-[14px] leading-[130%]", subText)}>
            {suffix}
          </Text>
        ) : null}
      </View>

      {!isLoading && badgeValue && badgeColor ? renderBadge() : null}
    </View>
  );

  if (special) {
    return (
      <LinearGradient
        colors={specialGradientColors}
        locations={[0, 0.8, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          borderRadius: 20,
          padding: 16,
          minWidth: cardMinWidth,
          minHeight: cardMinHeight,
          justifyContent: "center",
          flex: 1,
          borderWidth: 1,
          borderColor: specialBorderColor,
        }}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View
      className={cx(
        "flex-1 gap-4 rounded-2xl border border-shellLine bg-shellPanel p-4 web:backdrop-blur-md web:shadow-black/20",
        isLoading ? "opacity-70" : "",
      )}
      style={{ minWidth: cardMinWidth, minHeight: cardMinHeight }}
    >
      {content}
    </View>
  );
};

export default StatCard;
