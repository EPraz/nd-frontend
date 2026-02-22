import Wordmark from "@/src/assets/brand/NaviGate.svg"; // horizontal
import Mark from "@/src/assets/brand/NaviGate_RRSS-01.jpg"; // circular (o png)
import { Image, View } from "react-native";

type Props = { collapsed?: boolean };

export default function BrandLogo({ collapsed }: Props) {
  if (collapsed) {
    return (
      <Image
        source={Mark}
        style={{ width: 36, height: 36, borderRadius: 18 }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={{ height: 40, justifyContent: "center" }}>
      <Wordmark width={160} height={40} />
    </View>
  );
}
