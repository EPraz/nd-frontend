import { useSessionContext } from "@/src/context/SessionProvider";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { LoginAccessCard } from "./LoginAccessCard";
import { LoginBackground } from "./LoginBackground";
import { LoginVisualScene } from "./LoginVisualScene";
import { LOGIN_PALETTE } from "./login.constants";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const { signIn, signingIn = false } = useSessionContext();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1100;
  const isShortDesktop = isDesktop && height < 760;
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
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

  const shellMaxWidth = isDesktop ? 1500 : 680;
  const desktopPaddingY = isShortDesktop ? 16 : 40;
  const desktopShellHeight = Math.max(0, height - desktopPaddingY * 2);
  const authPanelWidth = width < 1280 ? 500 : 560;

  const shell = (
    <View
      className="overflow-hidden border web:backdrop-blur-xl"
      style={{
        borderColor: LOGIN_PALETTE.shellLine,
        backgroundColor: LOGIN_PALETTE.shell,
        flexDirection: isDesktop ? "row" : "column",
        height: isDesktop ? desktopShellHeight : undefined,
        borderRadius: isDesktop ? 0 : 30,
      }}
    >
      {isDesktop ? (
        <>
          <View style={{ flex: 1, minWidth: 0 }}>
            <LoginVisualScene />
          </View>
          <View
            className="border-l"
            style={{
              flexBasis: authPanelWidth,
              flexGrow: 0,
              flexShrink: 0,
              borderColor: LOGIN_PALETTE.shellLine,
            }}
          >
            <LoginAccessCard
              control={control}
              errors={errors}
              onSubmit={onSubmit}
              loading={signingIn}
              isSubmitting={isSubmitting}
            />
          </View>
        </>
      ) : (
        <>
          <View
            className="border-b"
            style={{ borderColor: LOGIN_PALETTE.shellLine }}
          >
            <LoginVisualScene compact />
          </View>
          <LoginAccessCard
            control={control}
            errors={errors}
            onSubmit={onSubmit}
            loading={signingIn}
            isSubmitting={isSubmitting}
          />
        </>
      )}
    </View>
  );

  return (
    <View className="relative min-w-0 flex-1 overflow-hidden bg-authCanvas">
      <LoginBackground />

      <KeyboardAvoidingView
        className="min-w-0 flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {isDesktop ? (
          <View
            className="min-w-0 flex-1 px-6 web:px-10"
            style={{ height, paddingVertical: desktopPaddingY }}
          >
            <View
              className="mx-auto min-w-0 flex-1 justify-center"
              style={{ width: "100%", maxWidth: shellMaxWidth }}
            >
              {shell}
            </View>
          </View>
        ) : (
          <ScrollView
            className="min-w-0 flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="min-w-0 flex-1 px-4 py-5 web:px-8 web:py-8">
              <View
                className="mx-auto min-w-0 flex-1 justify-center"
                style={{ width: "100%", maxWidth: shellMaxWidth }}
              >
                {shell}
              </View>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
