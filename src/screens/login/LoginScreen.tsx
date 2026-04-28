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
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
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

  const shellMaxWidth = isDesktop ? 1500 : 620;

  return (
    <View className="relative flex-1 bg-authCanvas">
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
          <View className="flex-1 px-4 py-6 web:px-10 web:py-10">
            <View
              className="mx-auto flex-1 justify-center"
              style={{ width: "100%", maxWidth: shellMaxWidth }}
            >
              <View
                className="overflow-hidden border web:backdrop-blur-xl"
                style={{
                  borderColor: LOGIN_PALETTE.shellLine,
                  backgroundColor: LOGIN_PALETTE.shell,
                  flexDirection: isDesktop ? "row" : "column",
                  minHeight: isDesktop ? 800 : undefined,
                  borderRadius: isDesktop ? 0 : 30,
                }}
              >
                {isDesktop ? (
                  <>
                    <View style={{ flex: 1 }}>
                      <LoginVisualScene />
                    </View>
                    <View
                      className="border-l"
                      style={{
                        flexBasis: 560,
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
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
