import {
  TextInput,
  useColorScheme,
  TextInputProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Colors } from "../constants/Colors";

type OmittedTextInputProps = Omit<TextInputProps, "style">;

interface ThemedTextInputProps extends OmittedTextInputProps {
  style?: StyleProp<TextStyle | ViewStyle>;
}

export default function ThemedTextInput({
  style,
  ...props
}: ThemedTextInputProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"] ?? Colors.light;

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
