import { Text } from "@/src/components/ui/text/Text";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react-native";
import { useState } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { ActivityIndicator, Pressable, View } from "react-native";
import AuthInput from "./AuthInput";
import { LOGIN_PALETTE } from "./login.constants";

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginAccessCardProps = {
  control: Control<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  onSubmit: () => void;
  loading: boolean;
  isSubmitting: boolean;
};

export function LoginAccessCard({
  control,
  errors,
  onSubmit,
  loading,
  isSubmitting,
}: LoginAccessCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isBusy = loading || isSubmitting;

  return (
    <View
      className="h-full justify-center px-6 py-8"
      style={{ backgroundColor: LOGIN_PALETTE.card }}
    >
      <View
        className="mx-auto w-full"
        style={{ maxWidth: 430, gap: 32 }}
      >
        <View className="gap-4">
          <Text
            className="font-semibold"
            style={{
              color: LOGIN_PALETTE.navy,
              fontSize: 29,
              lineHeight: 38,
            }}
          >
            Welcome back
          </Text>
          <Text
            className="text-[15px] leading-6"
            style={{ color: LOGIN_PALETTE.navySoft }}
          >
            Access the ARXIS intelligence platform.
          </Text>
        </View>

        <View style={{ gap: 22 }}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Enter a valid email address",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <AuthInput
                label="Email"
                placeholder="Enter your email"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                icon={<Mail size={20} color={LOGIN_PALETTE.navyMute} />}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <AuthInput
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
                icon={<LockKeyhole size={20} color={LOGIN_PALETTE.navyMute} />}
                error={errors.password?.message}
                rightAdornment={
                  showPassword ? (
                    <EyeOff size={20} color={LOGIN_PALETTE.navySoft} />
                  ) : (
                    <Eye size={20} color={LOGIN_PALETTE.navySoft} />
                  )
                }
                rightAdornmentLabel={
                  showPassword ? "Hide password" : "Show password"
                }
                onRightAdornmentPress={() => setShowPassword((value) => !value)}
              />
            )}
          />

          {errors.root?.message ? (
            <View
              className="flex-row items-center gap-3 rounded-[16px] border px-4 py-3"
              style={{
                borderColor: LOGIN_PALETTE.dangerLine,
                backgroundColor: LOGIN_PALETTE.dangerSoft,
              }}
            >
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: LOGIN_PALETTE.danger }}
              />
              <Text
                className="flex-1 text-[13px] leading-5"
                style={{ color: LOGIN_PALETTE.dangerText }}
              >
                {errors.root.message}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onSubmit}
          disabled={isBusy}
          className="w-full flex-row items-center justify-center overflow-hidden rounded-[8px]"
          style={{
            minHeight: 64,
            paddingHorizontal: 28,
            opacity: isBusy ? 0.62 : 1,
          }}
        >
          <ExpoLinearGradient
            colors={[LOGIN_PALETTE.action, LOGIN_PALETTE.actionHighlight]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ position: "absolute", inset: 0 }}
          />
          {isBusy ? (
            <ActivityIndicator color={LOGIN_PALETTE.navy} />
          ) : (
            <View className="w-full flex-row items-center justify-between">
              <View style={{ width: 24 }} />
              <Text
                className="text-base font-semibold"
                style={{ color: LOGIN_PALETTE.navy }}
              >
                Sign In
              </Text>
              <ArrowRight size={24} color={LOGIN_PALETTE.navy} />
            </View>
          )}
        </Pressable>

        <View className="flex-row items-center gap-3 pt-4">
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: LOGIN_PALETTE.aqua }}
          />
          <Text className="text-[13px]" style={{ color: LOGIN_PALETTE.navyMute }}>
            System Status:{" "}
            <Text className="text-[13px]" style={{ color: LOGIN_PALETTE.aqua }}>
              Operational
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
