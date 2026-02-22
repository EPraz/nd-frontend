import type { iconLib } from "@/src/constants";
import { iconLibMap } from "@/src/constants";
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
  const isPositive = badgeColor === "success";

  const isLoading = Boolean(loading);

  const cardMinWidth = 312;
  const cardMinHeight = 170;

  // Tokens nuevos
  const titleText = "text-textMain";
  const subText = "text-muted";

  // Badge con alpha (misma lógica pero con tokens nuevos)
  const badgeBg = isPositive ? "bg-success/15" : "bg-destructive/15";
  const badgeText = isPositive ? "text-success" : "text-destructive";

  const renderBadge = () => (
    <View className="flex-row gap-2 items-center">
      <View
        className={cx(
          "flex-row items-center gap-1 px-2 py-1 rounded-full",
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
      {/* Header */}
      <View className="flex-row items-center gap-3">
        <View
          className={cx(
            "w-10 h-10 rounded-full items-center justify-center border",
            "bg-baseBg border-border",
          )}
        >
          <Icon
            name={iconName as any}
            size={22}
            className={isLoading ? "text-muted" : titleText}
          />
        </View>

        <Text
          className={cx("text-[18px] leading-[130%] font-semibold", titleText)}
        >
          {title}
        </Text>
      </View>

      {/* Value + suffix */}
      <View className="gap-2 flex-row items-end">
        <Text
          className={cx("font-semibold leading-[120%] text-[40px]", titleText)}
        >
          {isLoading ? "—" : value}
        </Text>
        {suffix ? (
          <Text className={cx("text-[14px] leading-[130%] mb-1", subText)}>
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
        // Brand-consistente con tokens:
        // baseBg -> surface (oscuro elegante), y un toque de accent
        colors={["hsl(221 39% 16%)", "hsl(222 47% 11%)", "hsl(24 95% 60%)"]}
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
          borderColor: "hsl(220 22% 26%)",
        }}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View
      className={cx(
        "flex-1 gap-4 p-4 rounded-2xl border border-border bg-surface",
        isLoading ? "opacity-70" : "",
      )}
      style={{ minWidth: cardMinWidth, minHeight: cardMinHeight }}
    >
      {content}
    </View>
  );
};

export default StatCard;
