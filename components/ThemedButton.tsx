import {
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  PressableProps,
} from "react-native";
import { Colors } from "../constants/Colors";

interface ThemedButtonProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
}

function ThemedButton({ style, ...props }: ThemedButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primary,
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
