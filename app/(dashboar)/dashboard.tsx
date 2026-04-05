import React, { useState } from "react";
import { Alert, Dimensions, StyleSheet } from "react-native";
import AppointmentCalendar, {
  Appointment,
} from "../../pageComponents/AppointmentCalendar";
import ThemedView from "../../components/ThemendView";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest } from "../../lib/http";
import DashboardBottomSheet from "../../components/DashboardBottomSheet";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const BOTTOM_TAB_HEIGHT = 90;
const SHEET_MIN_HEIGHT = SCREEN_HEIGHT * 0.32;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.62;

type ApiAppointment = {
  _id: string;
  serviceName?: string;
  clientName?: string;
  appointmentTime: {
    start: string;
    end: string;
  };
};

const DashboardScreen: React.FC = () => {
  const { session } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(SHEET_MIN_HEIGHT);
  const [isWeekView, setIsWeekView] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!session?.token || !session?.user?.businessId) return;

    try {
      setLoading(true);
      const list = await apiRequest<ApiAppointment[]>(
        `/api/appointment/business/${session.user.businessId}`,
        {
          token: session.token,
        },
      );

      const mapped: Appointment[] = list.map((item) => ({
        id: item._id,
        title: item.serviceName || "Appointment",
        startTime: new Date(item.appointmentTime.start),
        endTime: new Date(item.appointmentTime.end),
        location: "",
        clientName: item.clientName || "Клиент",
      }));

      setAppointments(mapped);
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error
          ? error.message
          : "Неуспешно зареждане на часове.",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.token, session?.user?.businessId]);

  useFocusEffect(
    useCallback(() => {
      void fetchAppointments();
    }, [fetchAppointments]),
  );

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleSheetDrag = (nextHeight: number) => {
    setSheetHeight(nextHeight);
    setIsWeekView(nextHeight > (SHEET_MIN_HEIGHT + SHEET_MAX_HEIGHT) / 2);
  };

  return (
    <ThemedView style={styles.container}>
      <AppointmentCalendar
        appointments={appointments}
        onDateSelect={handleDateSelect}
        isWeekView={isWeekView}
      />

      <DashboardBottomSheet
        selectedDate={selectedDate}
        appointments={appointments}
        currentHeight={sheetHeight}
        onDrag={handleSheetDrag}
        minHeight={SHEET_MIN_HEIGHT}
        maxHeight={SHEET_MAX_HEIGHT}
        bottomOffset={BOTTOM_TAB_HEIGHT}
        onRefresh={() => void fetchAppointments()}
        refreshing={loading}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
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
