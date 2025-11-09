import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import AppointmentCalendar, {
  Appointment,
} from "../pageComponents/AppointmentCalendar";
import AppointmentList from "../pageComponents/AppointmentList";

const DUMMY_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    title: "Среща с Петров",
    startTime: new Date("2025-11-10T10:00:00"),
    endTime: new Date("2025-11-10T11:00:00"),
    location: "Office A",
    clientName: "Иван Петров",
  },
  {
    id: "2",
    title: "Проверка на Проекта",
    startTime: new Date("2025-11-10T14:30:00"),
    endTime: new Date("2025-11-10T15:00:00"),
    location: "Online",
    clientName: "Мария Георгиева",
  },
  {
    id: "3",
    title: "Седмичен Ревю",
    startTime: new Date("2025-11-12T09:00:00"),
    endTime: new Date("2025-11-12T10:30:00"),
    location: "Meeting Room",
    clientName: "Екипът",
  },
  // Добави още за тестване на маркирането
];

const DashboardScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [allAppointments, setAllAppointments] =
    useState<Appointment[]>(DUMMY_APPOINTMENTS);

  const filteredAppointments = useMemo(() => {
    return allAppointments
      .filter(
        (appt) => appt.startTime.toISOString().split("T")[0] === selectedDate
      )

      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [selectedDate, allAppointments]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Вашето Табло (Dashboard)</Text>

        {/* Календарът */}
        <AppointmentCalendar
          appointments={allAppointments}
          onDateSelect={handleDateSelect}
        />

        {/* Списък с часовете за избрания ден */}
        <Text style={styles.listHeader}>Часове за {selectedDate}</Text>
        <AppointmentList appointments={filteredAppointments} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 15,
    marginLeft: 10,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
  },
});

export default DashboardScreen;
