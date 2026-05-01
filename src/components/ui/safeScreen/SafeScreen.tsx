import React, { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const SafeScreen = ({ children }: PropsWithChildren) => {
  return (
    <SafeAreaView style={{ flex: 1, maxWidth: "100%", overflow: "hidden" }}>
      {children}
    </SafeAreaView>
  );
};

export default SafeScreen;
