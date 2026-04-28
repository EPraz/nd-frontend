import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useSessionContext } from "@/src/context/SessionProvider";
import LoginScreen from "../LoginScreen";

jest.mock("@/src/context/SessionProvider", () => ({
  useSessionContext: jest.fn(),
}));

jest.mock("lucide-react-native", () => ({
  ArrowRight: () => null,
  Eye: () => null,
  EyeOff: () => null,
  LockKeyhole: () => null,
  Mail: () => null,
}));

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

const signIn = jest.fn();

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSessionContext as jest.Mock).mockReturnValue({
      signIn,
      loading: false,
    });
    signIn.mockResolvedValue(undefined);
  });

  it("GIVEN the entry portal WHEN rendered SHOULD expose the credential form", () => {
    render(<LoginScreen />);

    expect(screen.getByText("Email")).toBeOnTheScreen();
    expect(screen.getByText("Password")).toBeOnTheScreen();
    expect(screen.getByText("Sign In")).toBeOnTheScreen();
  });

  it("GIVEN valid credentials WHEN submitted SHOULD sign in with trimmed email", async () => {
    render(<LoginScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Enter your email"),
      "  admin@navigate.test  ",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Enter your password"),
      "password123",
    );
    fireEvent.press(screen.getByText("Sign In"));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("admin@navigate.test", "password123");
    });
  });

  it("GIVEN invalid credentials WHEN submitted SHOULD keep the user on the form and show the login error", async () => {
    signIn.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<LoginScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Enter your email"),
      "viewer@navigate.test",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Enter your password"),
      "wrong-password",
    );
    fireEvent.press(screen.getByText("Sign In"));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeOnTheScreen();
    });
    expect(screen.getByText("Sign In")).toBeOnTheScreen();
  });
});
