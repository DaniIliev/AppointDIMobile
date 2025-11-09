export interface Appointment {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  clientName: string;
}

export interface CalendarDay {
  date: Date;
  hasAppointments: boolean;
}
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { Colors } from "../constants/Colors";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDateSelect: (date: string) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onDateSelect,
}) => {
  const markedDates: { [key: string]: MarkingProps } = {};

  appointments.forEach((appt) => {
    const dateString = appt.startTime.toISOString().split("T")[0];
    if (!markedDates[dateString]) {
      markedDates[dateString] = {
        marked: true,
        dotColor: Colors.primary,
      };
    }
  });

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day: DateData) => onDateSelect(day.dateString)}
        markedDates={markedDates}
        theme={{
          todayTextColor: "red", // Пример за персонализация
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});

export default AppointmentCalendar;
