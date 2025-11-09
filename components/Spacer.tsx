import { View, ViewStyle } from "react-native";

interface SpacerProps {
  width?: ViewStyle["width"];
  height?: ViewStyle["height"];
}

export default function Spacer({ width = "100%", height = 40 }: SpacerProps) {
  return <View style={{ width, height }} />;
}
