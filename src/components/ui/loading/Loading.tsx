import { ActivityIndicator, View } from "react-native";

type LoadingProps = {
  fullScreen?: boolean;
  size?: "small" | "large";
  className?: string;
};

const Loading = ({
  fullScreen = false,
  size = "large",
  className,
}: LoadingProps) => {
  return (
    <View
      className={[
        fullScreen
          ? "flex-1 items-center justify-center bg-baseBg"
          : "items-center justify-center",
        className,
      ].join(" ")}
    >
      <ActivityIndicator size={size} color="#FF8A3D" />
    </View>
  );
};
export default Loading;
