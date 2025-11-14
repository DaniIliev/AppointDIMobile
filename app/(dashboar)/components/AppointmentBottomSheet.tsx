// app/(dashboar)/components/AppointmentBottomSheet.tsx

import React, { useRef, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
  PanResponder,
  Dimensions,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Colors, ColorTheme } from "../../../constants/Colors";
import ThemedText from "../../../components/ThemedText";
import AppointmentList from "../../../pageComponents/AppointmentList";

const DUMMY_APPOINTMENTS: any[] = [];

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface BottomSheetProps {
  currentHeight: number;
  onDrag: (newHeight: number) => void;
  maxHeight: number;
  minHeight: number;
  bottomOffset: number;
  selectedDate: string;
}

const AppointListBottomSheet: React.FC<BottomSheetProps> = ({
  currentHeight,
  onDrag,
  maxHeight,
  minHeight,
  bottomOffset,
  selectedDate,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"] ?? Colors.light;

  const currentHeightRef = useRef(currentHeight);

  useEffect(() => {
    currentHeightRef.current = currentHeight;
  }, [currentHeight]);

  const filteredAppointments = useMemo(() => {
    return DUMMY_APPOINTMENTS;
  }, [selectedDate]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (evt, gestureState) => {
        const releasedHeight = currentHeightRef.current;
        const snapPointThreshold = (minHeight + maxHeight) / 2;
        const goingUp = gestureState.dy < 0;
        const goingDown = gestureState.dy > 0;
        let targetHeight: number;

        if (Math.abs(gestureState.dy) > 0.5) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

          if (goingUp && releasedHeight < maxHeight) {
            targetHeight = maxHeight;
            onDrag(targetHeight);
            return;
          }

          if (goingDown && releasedHeight > minHeight) {
            targetHeight = minHeight;
            onDrag(targetHeight);
            return;
          }
        }
        let newHeight = currentHeightRef.current - gestureState.dy;

        newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
        onDrag(newHeight);
      },

      onPanResponderRelease: (evt, gestureState) => {
        const releasedHeight = currentHeightRef.current;
        const snapPointThreshold = (minHeight + maxHeight) / 2;

        const shouldSnapToMax = releasedHeight > snapPointThreshold;

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        onDrag(shouldSnapToMax ? maxHeight : minHeight);
      },
    })
  ).current;

  const sheetTop = SCREEN_HEIGHT - currentHeight;

  return (
    <View
      style={[
        styles.sheetContainer,
        {
          height: currentHeight,
          top: sheetTop - bottomOffset,
          backgroundColor: theme.uiBackground,
        },
      ]}
    >
      <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
        <View style={[styles.grabber, { backgroundColor: theme.iconColor }]} />
        <ThemedText style={styles.header}>Часове за {selectedDate}</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        <AppointmentList appointments={filteredAppointments} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    zIndex: 10,
    bottom: 0,
  },
  dragHandleArea: {
    paddingVertical: 40,
    alignItems: "center",
    marginTop: -25,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
});

export default AppointListBottomSheet;
