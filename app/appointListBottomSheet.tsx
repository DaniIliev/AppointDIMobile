// app/appointListBottomSheet.tsx
import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ScrollView,
} from "react-native";
import React, { useMemo } from "react";
import { useLocalSearchParams } from "expo-router"; // <-- Добавяме useLocalSearchParams
import { Colors, ColorTheme } from "../constants/Colors";
import { Appointment } from "../pageComponents/AppointmentCalendar";
import { DUMMY_APPOINTMENTS } from "./dashboard";
import ThemedView from "../components/ThemendView";
import AppointmentList from "../pageComponents/AppointmentList";

export default function AppointListBottomSheet() {
  const colorScheme = useColorScheme();
  const theme: ColorTheme = (Colors[colorScheme as keyof typeof Colors] ??
    Colors.light) as ColorTheme;

  const { date } = useLocalSearchParams();
  const selectedDate =
    typeof date === "string" ? date : new Date().toISOString().split("T")[0];

  const filteredAppointments: Appointment[] = useMemo(() => {
    return (DUMMY_APPOINTMENTS as Appointment[])
      .filter(
        (appt) => appt.startTime.toISOString().split("T")[0] === selectedDate
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [selectedDate]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.grabber, { backgroundColor: theme.iconColor }]} />

      <Text style={[styles.header, { color: theme.title }]}>
        Часове за {selectedDate}
      </Text>
      <ScrollView>
        <AppointmentList appointments={filteredAppointments} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    paddingHorizontal: 15,
  },
  grabber: {
    width: 30,
    height: 4,
    borderRadius: 20,
    marginHorizontal: "auto",
    alignSelf: "center",
    marginBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
});
// import { StyleSheet, Text, useColorScheme, View } from "react-native";
// import React from "react";
// import ThemedView from "../components/ThemendView";
// import { Colors, ColorTheme } from "../constants/Colors";

// export default function appointListBottomSheet() {
//   const colorScheme = useColorScheme();

//   const theme: ColorTheme = (Colors[colorScheme as keyof typeof Colors] ??
//     Colors.light) as ColorTheme;
//   return (
//     <ThemedView>
//       <ThemedView
//         style={{
//           backgroundColor: theme.iconColor,
//           width: 30,
//           height: 2,
//           borderRadius: 20,
//           marginHorizontal: "auto",
//           marginTop: 5,
//         }}
//       />
//       <Text>profile</Text>
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({});
