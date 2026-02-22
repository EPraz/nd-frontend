import { clsx, type ClassValue } from "clsx";
import { useColorScheme } from "nativewind";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function usePlaceholderColor() {
  const { colorScheme } = useColorScheme();

  // En dark → texto claro con opacidad
  if (colorScheme === "dark") {
    return "rgba(243,244,246,0.45)";
    // F3F4F6 es tu text-main aproximado
  }

  // En light → texto oscuro con opacidad
  return "rgba(17,45,78,0.45)";
  // 112D4E es tu text-main light
}
