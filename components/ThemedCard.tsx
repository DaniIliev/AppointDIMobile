import {
  View,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Colors } from "../constants/Colors";
import { useAuth } from "../hooks/useAuth";

type OmittedViewProps = Omit<ViewProps, "style">;

interface ThemedCardProps extends OmittedViewProps {
  style?: StyleProp<ViewStyle>;
}

const ThemedCard: React.FC<ThemedCardProps> = ({ style, ...props }) => {
  const { themePreference } = useAuth();
  const colorScheme = themePreference ?? "dark";
  const theme = Colors[colorScheme] ?? Colors.light;

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
