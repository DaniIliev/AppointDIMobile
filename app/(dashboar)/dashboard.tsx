// app/(dashboar)/dashboard.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { DUMMY_APPOINTMENTS } from "../dashboard";
import AppointmentCalendar, {
  Appointment,
} from "../../pageComponents/AppointmentCalendar";
import { router } from "expo-router";
import ThemedView from "../../components/ThemendView";
import AppointListBottomSheet from "./components/AppointmentBottomSheet";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const BOTTOM_TAB_HEIGHT = 90;
const HEIGHT_50_PERCENT = SCREEN_HEIGHT * 0.4;
const HEIGHT_85_PERCENT = SCREEN_HEIGHT * 0.65;

const DashboardScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sheetHeight, setSheetHeight] = useState(HEIGHT_50_PERCENT);
  const [isWeekView, setIsWeekView] = useState(false);
  const handleSheetDrag = (newHeight: number) => {
    setSheetHeight(newHeight);
    // Ако новата височина е над 75% от екрана, превключваме на седмичен изглед
    if (newHeight >= HEIGHT_85_PERCENT * 0.9) {
      setIsWeekView(true);
    } else {
      setIsWeekView(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  // ... DUMMY_APPOINTMENTS
  const DUMMY_APPOINTMENTS: Appointment[] = []; // Вашите данни

  return (
    <ThemedView style={styles.container} safe={true}>
      <AppointmentCalendar
        appointments={DUMMY_APPOINTMENTS}
        onDateSelect={handleDateSelect}
        isWeekView={isWeekView}
      />

      <AppointListBottomSheet
        currentHeight={sheetHeight}
        onDrag={handleSheetDrag}
        // defaultHeight={HEIGHT_50_PERCENT}
        maxHeight={HEIGHT_85_PERCENT}
        minHeight={HEIGHT_50_PERCENT}
        bottomOffset={BOTTOM_TAB_HEIGHT}
        selectedDate={selectedDate}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 5,
    backgroundColor: "#6849a7",
  },
  button: {
    padding: 15,
    backgroundColor: "#6849a7",
    borderRadius: 8,
    margin: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default DashboardScreen;
// import { StyleSheet, Text, View } from "react-native";
// import React, { useMemo } from "react";

// export default function dashboard() {
//   const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);
//   return (
//     // <View>
//     //   <Text>Test</Text>
//     // </View>
//     <View style={styles.container}>
//       {/* <BottomSheet
//         snapPoints={snapPoints}
//         children={<Text>tfsdafsdafsdaest</Text>}
//       /> */}
//       <View
//         style={{
//           backgroundColor: "gray",
//           width: 30,
//           height: 2,
//           borderRadius: 20,
//           marginHorizontal: "auto",
//           marginTop: 4,
//         }}
//       />
//       <Text>tfsdafsdafsdaest</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//   },
// });
