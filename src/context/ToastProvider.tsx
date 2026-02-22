import { Card, CardContent, Text } from "@/src/components";
import { cn } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Portal } from "@rn-primitives/portal";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Pressable, View, ViewStyle } from "react-native";

type ToastType = "default" | "success" | "error" | "warning" | "info";

type ToastItem = {
  id: string;
  title: string;
  type: ToastType;
  durationMs: number;
};

type ToastContextValue = {
  show: (
    title: string,
    type?: ToastType,
    opts?: { durationMs?: number },
  ) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastContextValue>({
  show: () => {},
  dismiss: () => {},
  clear: () => {},
});

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const TOAST_STACK_STYLE: ViewStyle = {
  position: "absolute",
  top: 24,
  right: 24,
  zIndex: 999,
  width: 360,
  maxWidth: 420, // web se verá mejor
  // gap no existe en RN style, lo manejamos con wrapper
};

function styleByType(type: ToastType) {
  switch (type) {
    case "success":
      return {
        icon: "checkmark-circle" as const,
        iconClass: "text-success",
        barClass: "bg-success",
        borderClass: "border-success/30",
      };
    case "error":
      return {
        icon: "alert-circle" as const,
        iconClass: "text-destructive",
        barClass: "bg-destructive",
        borderClass: "border-destructive/30",
      };
    case "warning":
      return {
        icon: "warning" as const,
        iconClass: "text-warning",
        barClass: "bg-warning",
        borderClass: "border-warning/30",
      };
    case "info":
      return {
        icon: "information-circle" as const,
        iconClass: "text-info",
        barClass: "bg-info",
        borderClass: "border-info/30",
      };
    default:
      return {
        icon: "notifications" as const,
        iconClass: "text-muted",
        barClass: "bg-accent",
        borderClass: "border-border",
      };
  }
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current; // enter
  const progress = useRef(new Animated.Value(1)).current; // 1 -> 0

  const s = useMemo(() => styleByType(item.type), [item.type]);

  React.useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
    }).start();

    Animated.timing(progress, {
      toValue: 0,
      duration: item.durationMs,
      useNativeDriver: true, // transform => OK en mobile
    }).start(({ finished }) => {
      if (finished) onDismiss();
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateX }, { translateY }] }}
      className="w-full"
      pointerEvents="box-none"
    >
      <Card
        className={cn(
          "relative gap-0 py-0 overflow-hidden pb-[6px]",
          s.borderClass,
        )}
      >
        <CardContent className="py-4">
          <View className="flex-row items-center gap-3">
            <Ionicons name={s.icon} size={22} className={cn(s.iconClass)} />

            <View className="flex-1">
              <Text className="text-textMain text-[18px] font-semibold">
                {item.title}
              </Text>
            </View>

            <Pressable
              onPress={onDismiss}
              hitSlop={12}
              className="web:hover:opacity-80"
            >
              <Ionicons name="close" size={18} className="text-muted" />
            </Pressable>
          </View>
        </CardContent>

        {/* Progress bar bottom (mobile OK) */}
        <View
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 6 }}
        >
          <View className="h-full w-full bg-border/40" />
          <Animated.View
            className={cn("absolute left-0 top-0 h-full w-full", s.barClass)}
            style={{
              transform: [{ scaleX: progress }],
            }}
          />
        </View>
      </Card>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const show = useCallback(
    (
      title: string,
      type: ToastType = "default",
      opts?: { durationMs?: number },
    ) => {
      const id = uid();
      const durationMs = opts?.durationMs ?? 2600;

      setItems((prev) => {
        const next = [{ id, title, type, durationMs }, ...prev];
        return next.slice(0, 4);
      });
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ show, dismiss, clear }}>
      {children}

      <Portal name="toast">
        <View pointerEvents="box-none" style={TOAST_STACK_STYLE}>
          {items.map((item, idx) => (
            <View key={item.id} style={{ marginTop: idx === 0 ? 0 : 16 }}>
              <ToastCard item={item} onDismiss={() => dismiss(item.id)} />
            </View>
          ))}
        </View>
      </Portal>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
