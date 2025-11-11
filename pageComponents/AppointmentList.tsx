import React from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";
import { Appointment } from "./AppointmentCalendar";
import ThemedView from "../components/ThemendView";
import ThemedText from "../components/ThemedText";

interface AppointmentListProps {
  appointments: Appointment[];
}

const formatTime = (date: Date): string =>
  date.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });

const AppointmentItem: React.FC<{ item: Appointment }> = ({ item }) => (
  <ThemedView style={styles.itemContainer}>
    <ThemedView style={styles.timeBlock}>
      <ThemedText style={styles.timeText}>
        {formatTime(item.startTime)}
      </ThemedText>
      <ThemedText style={styles.timeDivider}>-</ThemedText>
      <ThemedText style={styles.timeText}>
        {formatTime(item.endTime)}
      </ThemedText>
    </ThemedView>
    <ThemedView style={styles.detailsBlock}>
      <ThemedText style={styles.titleText} numberOfLines={1}>
        {item.title}
      </ThemedText>
      <ThemedText style={styles.clientText}>
        Клиент: {item.clientName}
      </ThemedText>
    </ThemedView>
  </ThemedView>
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
  itemContainer: {
    flexDirection: "row",
    padding: 5,
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  timeBlock: {
    flexDirection: "row",
    gap: 2,
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
    // flex: 1,
    flexDirection: "row",
    gap: 7,
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
