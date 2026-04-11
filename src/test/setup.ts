import "@testing-library/react-native/matchers";

jest.mock("@expo/vector-icons", () => {
  const MockIcon = () => null;

  return {
    Feather: MockIcon,
    Ionicons: MockIcon,
  };
});

jest.mock("@/src/context/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
  }),
}));
