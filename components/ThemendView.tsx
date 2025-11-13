import {
  useColorScheme,
  View,
  ViewProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Colors } from "../constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type OmittedViewProps = Omit<ViewProps, "style">;

interface ThemedViewProps extends OmittedViewProps {
  style?: StyleProp<ViewStyle>;
  safe?: boolean;
}

const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  safe = false,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"] ?? Colors.light;

  if (!safe)
    return (
      <View style={[{ backgroundColor: theme.background }, style]} {...props} />
    );

  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedView;
