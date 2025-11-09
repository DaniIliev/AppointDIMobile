// src/components/AppointmentList.tsx

import React from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";
import { Appointment } from "./AppointmentCalendar";

interface AppointmentListProps {
  appointments: Appointment[];
}

const formatTime = (date: Date): string =>
  date.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });

const AppointmentItem: React.FC<{ item: Appointment }> = ({ item }) => (
  <View style={styles.itemContainer}>
    <View style={styles.timeBlock}>
      <Text style={styles.timeText}>{formatTime(item.startTime)}</Text>
      <Text style={styles.timeDivider}>-</Text>
      <Text style={styles.timeText}>{formatTime(item.endTime)}</Text>
    </View>
    <View style={styles.detailsBlock}>
      <Text style={styles.titleText} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.clientText}>Клиент: {item.clientName}</Text>
    </View>
  </View>
);

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments }) => {
  if (appointments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Няма запазени часове за тази дата.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={appointments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <AppointmentItem item={item} />}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  // ... (Добави стиловете по твой вкус)
  itemContainer: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 4,
  },
  timeBlock: {
    width: 80, // Фиксирана ширина за часовете
    marginRight: 10,
    alignItems: "center",
  },
  timeText: {
    fontWeight: "bold",
    color: Colors.primary,
    fontSize: 14,
  },
  timeDivider: {
    fontSize: 10,
    color: "#aaa",
  },
  detailsBlock: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  clientText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default AppointmentList;
