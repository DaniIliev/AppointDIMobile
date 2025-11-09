import {
  useColorScheme,
  View,
  ViewProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Colors } from "../constants/Colors";

type OmittedViewProps = Omit<ViewProps, "style">;

interface ThemedViewProps extends OmittedViewProps {
  style?: StyleProp<ViewStyle>;
}

const ThemedView: React.FC<ThemedViewProps> = ({ style, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"] ?? Colors.light;

  return (
    <View style={[{ backgroundColor: theme.background }, style]} {...props} />
  );
};

export default ThemedView;
