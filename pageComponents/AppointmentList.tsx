import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";
import { Appointment } from "./AppointmentCalendar";
import ThemedView from "../components/ThemendView";
import ThemedText from "../components/ThemedText";
import { useAuth } from "../hooks/useAuth";

interface AppointmentListProps {
  appointments: Appointment[];
}

const formatTime = (date: Date): string =>
  date.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });

const AppointmentItem: React.FC<{
  item: Appointment;
  primaryColor: string;
  mutedTextColor: string;
  iconColor: string;
}> = ({ item, primaryColor, mutedTextColor, iconColor }) => (
  <ThemedView style={styles.itemContainer}>
    <ThemedView style={styles.timeBlock}>
      <ThemedText style={[styles.timeText, { color: primaryColor }]}>
        {formatTime(item.startTime)}
      </ThemedText>
      <ThemedText style={[styles.timeDivider, { color: iconColor }]}>
        -
      </ThemedText>
      <ThemedText style={[styles.timeText, { color: primaryColor }]}>
        {formatTime(item.endTime)}
      </ThemedText>
    </ThemedView>
    <ThemedView style={styles.detailsBlock}>
      <ThemedText style={styles.titleText} numberOfLines={1}>
        {item.title}
      </ThemedText>
      <ThemedText style={[styles.clientText, { color: mutedTextColor }]}>
        Клиент: {item.clientName}
      </ThemedText>
    </ThemedView>
  </ThemedView>
);

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments }) => {
  const { themePreference, primaryColor } = useAuth();
  const resolvedScheme = themePreference ?? "dark";
  const colorScheme =
    resolvedScheme === "dark" || resolvedScheme === "light"
      ? resolvedScheme
      : "dark";
  const theme = Colors[colorScheme ?? "light"] ?? Colors.light;

  const mutedTextColor = theme.iconColor;

  if (appointments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={[styles.emptyText, { color: mutedTextColor }]}>
          Няма запазени часове за тази дата.
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={appointments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AppointmentItem
          item={item}
          primaryColor={primaryColor}
          mutedTextColor={mutedTextColor}
          iconColor={theme.iconColor}
        />
      )}
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
    borderBottomColor: "rgba(130,130,130,0.35)",
  },
  timeBlock: {
    flexDirection: "row",
    gap: 2,
    marginRight: 10,
    alignItems: "center",
  },
  timeText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  timeDivider: {
    fontSize: 10,
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
    marginTop: 2,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default AppointmentList;
