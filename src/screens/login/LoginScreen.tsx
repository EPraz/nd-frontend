import { Button, Text } from "@/src/components";
import { useSessionContext } from "@/src/context";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import AuthInput from "./AuthInput";
import { LoginBackground } from "./LoginBackground";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const { signIn, loading } = useSessionContext();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1180;
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "admin@navigate.test",
      password: "NavigateAdminAccess2026!",
    },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    clearErrors("root");

    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError("root", {
        type: "server",
        message: e instanceof Error ? e.message : "Login failed",
      });
    }
  });

  const shellMaxWidth = isDesktop ? 1080 : isTablet ? 820 : 560;
  const leftFlex = isDesktop ? 1.15 : undefined;
  const rightWidth = isDesktop ? 388 : undefined;
  const titleClassName = isDesktop
    ? "text-[42px] leading-[48px]"
    : isTablet
      ? "text-[36px] leading-[42px]"
      : "text-[30px] leading-[36px]";

  return (
    <View className="flex-1 relative bg-authCanvas">
      <LoginBackground />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-4 py-4 web:px-6 web:py-5">
            <View
              className="mx-auto flex-1 justify-center"
              style={{ width: "100%", maxWidth: shellMaxWidth }}
            >
              <View
                className="overflow-hidden rounded-[28px] border border-authLine bg-authShell web:backdrop-blur-xl"
                style={{
                  flexDirection: isDesktop ? "row" : "column",
                  minHeight: isDesktop ? 640 : undefined,
                }}
              >
                <View
                  className="px-5 py-6 web:px-8 web:py-8 "
                  style={{ flex: leftFlex }}
                >
                  <View className="max-w-[480px] gap-5 h-full w-full justify-between">
                    <View className="gap-3 ">
                      <View className="self-start rounded-full border border-authBadgeBorder bg-authBadge px-4 py-2">
                        <Text className="text-[11px] font-semibold uppercase tracking-[0.2em] text-authHighlight">
                          ARXIS
                        </Text>
                      </View>

                      <View className="gap-2">
                        <Text className="text-[12px] font-medium uppercase tracking-[0.16em] text-authCopySubtle">
                          Advanced Risk &amp; Operational Intelligence System
                        </Text>
                        <Text
                          className={[
                            titleClassName,
                            "max-w-[470px] font-semibold text-authCopy",
                          ].join(" ")}
                        >
                          Secure entry to the maritime operations workspace.
                        </Text>
                        {/* <Text className="max-w-[460px] text-[15px] leading-7 text-authCopyMuted">
                          Sign in to access certificates, crew readiness,
                          maintenance context, and the current operational
                          picture for this environment.
                        </Text> */}
                      </View>
                    </View>

                    <View className="rounded-[22px] border border-authLine bg-authPanelSoft p-4 gap-3">
                      <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-authHighlight">
                        Workspace focus
                      </Text>
                      <Text className="text-base font-semibold text-authCopy">
                        Built for operational clarity, secure access, and
                        evidence-driven workflow.
                      </Text>
                      <Text className="text-sm leading-6 text-authCopyMuted">
                        The access layer stays compact so the product feels fast
                        on mobile, stable on tablet, and sharp on desktop.
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  className="border-t justify-between border-authLine bg-authPanel px-5 py-6 web:border-t-0 web:border-l web:px-7 web:py-8"
                  style={{ width: rightWidth }}
                >
                  <View className="gap-6">
                    <View className="gap-2">
                      <View className="flex-row items-center gap-3">
                        <View className="h-11 w-11 items-center justify-center rounded-full border border-authBadgeBorder bg-authBadge">
                          <ShieldCheck
                            size={20}
                            color="hsl(var(--auth-highlight))"
                          />
                        </View>
                        <View className="flex-1 gap-1">
                          <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-authCopySubtle">
                            Secure access
                          </Text>
                          <Text className="text-3xl font-semibold text-authCopy">
                            Sign in
                          </Text>
                        </View>
                      </View>

                      <Text className="text-sm leading-6 text-authCopyMuted">
                        Enter your credentials to continue into the current
                        operational workspace.
                      </Text>
                    </View>

                    <View className="gap-4 ">
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
                            placeholder="admin@navigate.test"
                            value={value}
                            onChangeText={onChange}
                            keyboardType="email-address"
                            icon={
                              <Mail
                                size={17}
                                color="hsl(var(--auth-highlight))"
                              />
                            }
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
                            icon={
                              <LockKeyhole
                                size={17}
                                color="hsl(var(--auth-highlight))"
                              />
                            }
                            error={errors.password?.message}
                          />
                        )}
                      />

                      {errors.root?.message ? (
                        <View className="rounded-[20px] border border-destructive/35 bg-destructive/10 px-4 py-3">
                          <Text className="text-sm text-destructive">
                            {errors.root.message}
                          </Text>
                        </View>
                      ) : null}

                      <Button
                        onPress={onSubmit}
                        loading={loading || isSubmitting}
                        size="lg"
                        className="h-14 w-full rounded-[24px] bg-authHighlight"
                        rightIcon={
                          !(loading || isSubmitting) ? (
                            <ArrowRight
                              size={18}
                              color="hsl(var(--auth-canvas))"
                            />
                          ) : undefined
                        }
                      >
                        <Text className="text-base font-semibold text-authCanvas">
                          Enter workspace
                        </Text>
                      </Button>
                    </View>

                    {/* <View className="gap-2 rounded-[22px] border border-authLine bg-authPanelSoft p-4">
                      <Text className="text-[11px] font-semibold uppercase tracking-[0.16em] text-authCopySubtle">
                        Demo access
                      </Text>
                      <Text className="text-sm leading-6 text-authCopyMuted">
                        Default seed credentials are prefilled to speed up local
                        testing on this environment.
                      </Text>
                    </View> */}
                  </View>
                  <Text className="text-center text-xs tracking-[0.16em] text-authCopySubtle">
                    Powered by ARXIS · Private access gateway
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
