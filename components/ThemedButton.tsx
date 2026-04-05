import {
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  PressableProps,
} from "react-native";
import { useAuth } from "../hooks/useAuth";

interface ThemedButtonProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
}

function ThemedButton({ style, ...props }: ThemedButtonProps) {
  const { primaryColor } = useAuth();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: primaryColor },
        pressed && styles.pressed,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 14,
    borderRadius: 6,
    marginVertical: 10,
    minWidth: 100,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.5,
  },
});

export default ThemedButton;
