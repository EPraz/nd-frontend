import { useAuthenticatedImageSource } from "@/src/hooks/useAuthenticatedImageSource";
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
  const source = useAuthenticatedImageSource(uri);

  return (
    <View className={cn("h-full w-full", className)}>
      <View
        className={cn(
          "h-full w-full items-center justify-center overflow-hidden bg-black",
          padded ? "p-3" : "",
          stageClassName,
        )}
      >
        {source ? (
          <Image
            source={source}
            contentFit="contain"
            contentPosition="center"
            style={{ width: "100%", height: "100%" }}
          />
        ) : null}
      </View>
    </View>
  );
}
