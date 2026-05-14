import { clsx, type ClassValue } from "clsx";
import { useColorScheme } from "nativewind";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function usePlaceholderColor() {
  const { colorScheme } = useColorScheme();

  if (colorScheme === "dark") {
    return "rgba(243,244,246,0.45)";
  }

  return "rgba(16,35,64,0.56)";
}
