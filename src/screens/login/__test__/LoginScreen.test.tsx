import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useSessionContext } from "@/src/context/SessionProvider";
import LoginScreen from "../LoginScreen";

jest.mock("@/src/context/SessionProvider", () => ({
  useSessionContext: jest.fn(),
}));

jest.mock("lucide-react-native", () => ({
  ArrowRight: () => null,
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

  it("GIVEN the entry portal WHEN rendered SHOULD show the new access composition", () => {
    render(<LoginScreen />);

    expect(screen.getByText("Welcome to ARXIS")).toBeOnTheScreen();
    expect(screen.getByText("ARXIS Maritime")).toBeOnTheScreen();
    expect(screen.getByText("Enter workspace")).toBeOnTheScreen();
  });

  it("GIVEN valid credentials WHEN submitted SHOULD sign in with trimmed email", async () => {
    render(<LoginScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("admin@navigate.test"),
      "  admin@navigate.test  ",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Enter your password"),
      "password123",
    );
    fireEvent.press(screen.getByText("Enter workspace"));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("admin@navigate.test", "password123");
    });
  });
});
