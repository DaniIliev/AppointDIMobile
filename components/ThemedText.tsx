import {
  Text,
  useColorScheme,
  TextProps,
  StyleProp,
  TextStyle,
} from "react-native";
import { Colors } from "../constants/Colors";

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
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"] ?? Colors.light;

  const textColor = title ? theme.title : theme.text;

  return <Text style={[{ color: textColor }, style]} {...props} />;
}
