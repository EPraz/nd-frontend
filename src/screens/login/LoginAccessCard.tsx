import { Button } from "@/src/components/ui/button/Button";
import { Text } from "@/src/components/ui/text/Text";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react-native";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { View } from "react-native";
import AuthInput from "./AuthInput";
import { LoginBrandMark } from "./LoginBrandMark";
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
  return (
    <View
      className="justify-center h-full px-5 py-5 web:px-8 web:py-8"
      style={{ backgroundColor: LOGIN_PALETTE.card }}
    >
      <View className="mx-auto w-full max-w-[356px] gap-6 ">
        <View className="gap-3">
          <View className="gap-2">
            <View className="flex-row gap-2">
              <Text
                className="text-[32px] font-semibold leading-[42px]"
                style={{ color: LOGIN_PALETTE.navy }}
              >
                Welcome to ARXIS
              </Text>
              <LoginBrandMark />
            </View>
            <Text
              className="text-[14px] leading-6"
              style={{ color: LOGIN_PALETTE.navySoft }}
            >
              Sign in once and continue into projects, company control, and the
              operational surfaces beyond them.
            </Text>
          </View>
        </View>

        <View className="gap-3">
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
                placeholder="your@email.test"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                icon={<Mail size={18} color={LOGIN_PALETTE.navy} />}
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
                secureTextEntry
                icon={<LockKeyhole size={18} color={LOGIN_PALETTE.navy} />}
                error={errors.password?.message}
              />
            )}
          />

          {errors.root?.message ? (
            <View
              className="flex-row items-center gap-3 rounded-[18px] border px-4 py-3"
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

        {/* <View className="flex-row items-center justify-between gap-3">
          <Text
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: LOGIN_PALETTE.navyMute }}
          >
            Private access
          </Text>
          <Text
            className="text-[12px]"
            style={{ color: LOGIN_PALETTE.navySoft }}
          >
            Local admin email is prefilled
          </Text>
        </View> */}

        <Button
          onPress={onSubmit}
          loading={loading || isSubmitting}
          spinnerColor={LOGIN_PALETTE.card}
          className="h-[52px] w-full rounded-[18px]"
          style={{ backgroundColor: LOGIN_PALETTE.accent }}
          rightIcon={
            !(loading || isSubmitting) ? (
              <ArrowRight size={18} color={LOGIN_PALETTE.navy} />
            ) : undefined
          }
        >
          <Text
            className="text-base font-semibold"
            style={{ color: LOGIN_PALETTE.navy }}
          >
            Enter workspace
          </Text>
        </Button>

        <Text
          className="text-center text-[10px] leading-6"
          style={{ color: LOGIN_PALETTE.navyMute }}
        >
          Secure maritime access for ARXIS workspaces and control surfaces.
        </Text>
      </View>
    </View>
  );
}
