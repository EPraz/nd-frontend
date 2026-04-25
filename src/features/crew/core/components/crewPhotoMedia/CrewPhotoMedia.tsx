import { cn } from "@/src/lib/utils";
import { Image } from "expo-image";
import { View } from "react-native";

type Props = {
  uri: string;
  className?: string;
  stageClassName?: string;
  padded?: boolean;
};

export default function CrewPhotoMedia({
  uri,
  className,
  stageClassName,
  padded = true,
}: Props) {
  return (
    <View className={cn("h-full w-full", className)}>
      <View
        className={cn(
          "h-full w-full items-center justify-center overflow-hidden bg-black",
          padded ? "p-3" : "",
          stageClassName,
        )}
      >
        <Image
          source={{ uri }}
          contentFit="contain"
          contentPosition="center"
          style={{ width: "100%", height: "100%" }}
        />
      </View>
    </View>
  );
}
