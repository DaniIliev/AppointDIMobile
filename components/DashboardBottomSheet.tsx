import React, { useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  LayoutAnimation,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  UIManager,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "./ThemedText";
import AppointmentList from "../pageComponents/AppointmentList";
import { Appointment } from "../pageComponents/AppointmentCalendar";
import { Colors } from "../constants/Colors";
import { useAuth } from "../hooks/useAuth";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type DashboardBottomSheetProps = {
  selectedDate: string;
  appointments: Appointment[];
  currentHeight: number;
  onDrag: (nextHeight: number) => void;
  minHeight: number;
  maxHeight: number;
  bottomOffset: number;
  onRefresh: () => void;
  refreshing?: boolean;
};

export default function DashboardBottomSheet({
  selectedDate,
  appointments,
  currentHeight,
  onDrag,
  minHeight,
  maxHeight,
  bottomOffset,
  onRefresh,
  refreshing = false,
}: DashboardBottomSheetProps) {
  const { themePreference } = useAuth();
  const colorScheme = themePreference ?? "dark";
  const theme = Colors[colorScheme] ?? Colors.light;
  const currentHeightRef = useRef(currentHeight);
  currentHeightRef.current = currentHeight;

  const filtered = useMemo(() => {
    return appointments
      .filter(
        (appointment) =>
          appointment.startTime.toISOString().split("T")[0] === selectedDate,
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [appointments, selectedDate]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        let nextHeight = currentHeightRef.current - gestureState.dy;
        nextHeight = Math.max(minHeight, Math.min(maxHeight, nextHeight));
        onDrag(nextHeight);
      },
      onPanResponderRelease: () => {
        const threshold = (minHeight + maxHeight) / 2;
        const snapHeight =
          currentHeightRef.current > threshold ? maxHeight : minHeight;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        onDrag(snapHeight);
      },
    }),
  ).current;

  const top = SCREEN_HEIGHT - currentHeight - bottomOffset;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.uiBackground,
          top,
          height: currentHeight,
        },
      ]}
    >
      <View style={styles.dragArea} {...panResponder.panHandlers}>
        <View style={[styles.grabber, { backgroundColor: theme.iconColor }]} />
        <View style={styles.headerRow}>
          <ThemedText style={styles.title}>Часове за {selectedDate}</ThemedText>
          <Pressable
            style={[
              styles.refreshButton,
              { backgroundColor: theme.background },
            ]}
            onPress={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={theme.title} />
            ) : (
              <Ionicons name="refresh-outline" size={18} color={theme.title} />
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.listWrap}>
        <AppointmentList appointments={filtered} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
  },
  dragArea: {
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 3,
    marginBottom: 8,
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    flex: 1,
  },
  refreshButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  listWrap: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
});
