import { useColorScheme } from "react-native";
import { Colors } from "../../../constants/Colors";
import { useAuth } from "../../../hooks/useAuth";
import { CardStatus, Priority } from "../../../Global/Types/kanban";

export type ThemePalette = {
  bg: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
  danger: string;
};

export function alpha(color: string, opacityHex: string) {
  return `${color}${opacityHex}`;
}

export function getPriorityColors(
  theme: ThemePalette,
): Record<Priority, string> {
  return {
    low: theme.mutedText,
    medium: theme.primary,
    high: Colors.warning,
    urgent: theme.danger,
  };
}

export function getStatusColors(
  theme: ThemePalette,
): Record<CardStatus, string> {
  return {
    Planned: theme.mutedText,
    "In Progress": theme.primary,
    Finished: Colors.primary,
  };
}

export function getColumnPalette(theme: ThemePalette) {
  return [
    theme.primary,
    Colors.primary,
    theme.text,
    theme.mutedText,
    Colors.warning,
    theme.primary,
    Colors.primary,
    theme.text,
    theme.mutedText,
    Colors.warning,
  ];
}

export function useKanbanTheme(): ThemePalette {
  const systemScheme = useColorScheme();
  const { themePreference, primaryColor } = useAuth();
  const resolvedScheme: "light" | "dark" =
    themePreference ?? (systemScheme === "dark" ? "dark" : "light");
  const baseTheme = Colors[resolvedScheme];

  return {
    bg: baseTheme.background,
    surface: baseTheme.navBackground,
    text: baseTheme.title,
    mutedText: baseTheme.iconColor,
    border: baseTheme.uiBackground,
    primary: primaryColor ?? Colors.primary,
    danger: Colors.warning,
  };
}
