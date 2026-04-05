import {
  TextInput,
  useColorScheme,
  TextInputProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Colors } from "../constants/Colors";
import { useAuth } from "../hooks/useAuth";

type OmittedTextInputProps = Omit<TextInputProps, "style">;

interface ThemedTextInputProps extends OmittedTextInputProps {
  style?: StyleProp<TextStyle | ViewStyle>;
}

export default function ThemedTextInput({
  style,
  ...props
}: ThemedTextInputProps) {
  const systemScheme = useColorScheme();
  const { themePreference } = useAuth();
  const colorScheme = themePreference ?? systemScheme ?? "light";
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <TextInput
      style={[
        {
          backgroundColor: theme.uiBackground,
          color: theme.text,
          padding: 22,
          borderRadius: 6,
        },
        style,
      ]}
      {...props}
    />
  );
}
