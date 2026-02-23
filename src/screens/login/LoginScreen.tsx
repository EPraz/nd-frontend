import { Button, Field, Text } from "@/src/components";
import { useSessionContext } from "@/src/context";
import { usePlaceholderColor } from "@/src/lib/utils";
import { useState } from "react";
import { View } from "react-native";
import { LoginBackground } from "./LoginBackground";

export default function LoginScreen() {
  const { signIn, loading } = useSessionContext();
  const [email, setEmail] = useState("admin@navigate.test");
  const [password, setPassword] = useState(""); //vengoatestearesto
  const [error, setError] = useState<string | null>(null);
  const placeholderColor = usePlaceholderColor();

  const onSubmit = async () => {
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    }
  };

  return (
    <View className="flex-1 relative">
      <LoginBackground />

      <View className="flex-1 web:flex-row">
        <View className="flex-1 items-center justify-center p-6 web:w-1/2">
          <View
            className={[
              "w-full max-w-[420px] rounded-2xl border border-border/60 p-7 gap-5 shadow-lg",
              // sólido en mobile (evita “transparente”)
              // "bg-surface/95",
              // glass solo web
              "bg-surface/80 backdrop-blur-md shadow-black/40",
            ].join(" ")}
          >
            <View className="gap-1">
              <Text className="text-2xl font-semibold tracking-tight text-textMain">
                Welcome back
              </Text>
              <Text className="text-sm text-muted/70">
                Inicia sesión para continuar.
              </Text>
            </View>

            <View className="gap-3">
              <View className="gap-2">
                <Field
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="gap-2">
                <Field
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry
                />
              </View>

              {error ? (
                <Text className="text-sm text-destructive">{error}</Text>
              ) : null}

              <Button
                onPress={onSubmit}
                loading={loading}
                variant="default"
                size="lg"
                className="w-full"
              >
                Sign in
              </Button>

              <Text className="text-xs text-muted/70 text-center">
                Navigate Marine • Secure Access
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
