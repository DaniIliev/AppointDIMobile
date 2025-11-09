import {
  View,
  useColorScheme,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Colors } from "../constants/Colors";

type OmittedViewProps = Omit<ViewProps, "style">;

interface ThemedCardProps extends OmittedViewProps {
  style?: StyleProp<ViewStyle>;
}

const ThemedCard: React.FC<ThemedCardProps> = ({ style, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"] ?? Colors.light;

  return (
    <View
      style={[
        {
          backgroundColor: theme.uiBackground,
        },
        styles.card,
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedCard;
const styles = StyleSheet.create({
  card: {
    borderRadius: 5,
    padding: 20,
  },
});
