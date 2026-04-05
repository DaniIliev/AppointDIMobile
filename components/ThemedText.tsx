import {
  Text,
  useColorScheme,
  TextProps,
  StyleProp,
  TextStyle,
} from "react-native";
import { Colors } from "../constants/Colors";
import { useAuth } from "../hooks/useAuth";

type OmittedTextProps = Omit<TextProps, "style">;

interface ThemedTextProps extends OmittedTextProps {
  style?: StyleProp<TextStyle>;
  title?: boolean;
}

export default function ThemedText({
  style,
  title = false,
  ...props
}: ThemedTextProps) {
  const systemScheme = useColorScheme();
  const { themePreference } = useAuth();
  const colorScheme = themePreference ?? systemScheme ?? "light";
  const theme = Colors[colorScheme] ?? Colors.light;

  const textColor = title ? theme.title : theme.text;

  return <Text style={[{ color: textColor }, style]} {...props} />;
}
