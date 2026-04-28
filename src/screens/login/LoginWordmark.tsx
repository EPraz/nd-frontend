import { Text } from "@/src/components/ui/text/Text";
import { View } from "react-native";
import { LOGIN_PALETTE } from "./login.constants";

const WORDMARK_LETTERS = ["A", "R", "X", "I", "S"] as const;

type LoginWordmarkProps = {
  compact: boolean;
};

type WordmarkLetterProps = {
  children: string;
  compact: boolean;
  isLast?: boolean;
};

function getWordmarkMetrics(compact: boolean) {
  return {
    fontSize: compact ? 44 : 74,
    lineHeight: compact ? 52 : 84,
    spacing: compact ? 10 : 18,
    xWidth: compact ? 34 : 57,
  };
}

function WordmarkLetter({
  children,
  compact,
  isLast = false,
}: WordmarkLetterProps) {
  const { fontSize, lineHeight, spacing } = getWordmarkMetrics(compact);

  return (
    <Text
      className="font-semibold"
      style={{
        color: LOGIN_PALETTE.navy,
        fontSize,
        lineHeight,
        marginRight: isLast ? 0 : spacing,
      }}
    >
      {children}
    </Text>
  );
}

function SplitAccentX({ compact }: LoginWordmarkProps) {
  const { fontSize, lineHeight, spacing, xWidth } = getWordmarkMetrics(compact);
  const textStyle = {
    fontSize,
    lineHeight,
  };

  return (
    <View
      className="relative overflow-hidden"
      style={{
        width: xWidth,
        height: lineHeight,
        marginRight: spacing,
      }}
    >
      <Text
        className="absolute left-0 top-0 font-semibold"
        style={{ ...textStyle, color: LOGIN_PALETTE.navy }}
      >
        X
      </Text>
      <View
        className="absolute left-0 top-0 overflow-hidden"
        style={{ width: xWidth, height: lineHeight * 0.52 }}
      >
        <Text
          className="absolute left-0 top-0 font-semibold"
          style={{ ...textStyle, color: LOGIN_PALETTE.actionHighlight }}
        >
          X
        </Text>
      </View>
    </View>
  );
}

export function LoginWordmark({ compact }: LoginWordmarkProps) {
  return (
    <View className="flex-row items-center">
      {WORDMARK_LETTERS.map((letter, index) =>
        letter === "X" ? (
          <SplitAccentX key={letter} compact={compact} />
        ) : (
          <WordmarkLetter
            key={letter}
            compact={compact}
            isLast={index === WORDMARK_LETTERS.length - 1}
          >
            {letter}
          </WordmarkLetter>
        ),
      )}
    </View>
  );
}
