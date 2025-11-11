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
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Dimensions,
  LayoutAnimation,
} from "react-native";
import { CalendarList, DateData } from "react-native-calendars";
import { Colors } from "../constants/Colors";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";
import ThemedText from "../components/ThemedText";
import dayjs from "dayjs";
import "dayjs/locale/bg";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekday from "dayjs/plugin/weekday";
import ThemedView from "../components/ThemendView";

dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.locale("bg");

const { width } = Dimensions.get("window");

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDateSelect: (date: string) => void;
}

const getWeekRange = (
  dateString: string
): { dateString: string; dayName: string }[] => {
  const startOfWeek = dayjs(dateString).weekday(0);
  const week = [];
  for (let i = 0; i < 7; i++) {
    const currentDay = startOfWeek.add(i, "day");
    week.push({
      dateString: currentDay.format("YYYY-MM-DD"),
      dayName: currentDay.format("ddd").toUpperCase(),
    });
  }
  return week;
};

interface CustomWeekViewProps {
  selectedDay: string;
  markedDates: { [key: string]: MarkingProps };
  handleDayPress: (day: DateData) => void;
  theme: any;
}

const CustomWeekView: React.FC<CustomWeekViewProps> = ({
  selectedDay,
  markedDates,
  handleDayPress,
  theme,
}) => {
  const week = useMemo(() => getWeekRange(selectedDay), [selectedDay]);
  return (
    <ThemedView
      style={[
        weekStyles.weekContainer,
        { backgroundColor: theme.uiBackground },
      ]}
    >
      <ThemedView
        style={[
          weekStyles.dayNamesRow,
          { backgroundColor: theme.uiBackground },
        ]}
      >
        {week.map((day) => (
          <ThemedText
            key={day.dateString + "name"}
            style={[
              weekStyles.dayNameText,
              { color: theme.text, backgroundColor: theme.uiBackground },
            ]}
          >
            {day.dayName}
          </ThemedText>
        ))}
      </ThemedView>

      <ThemedView
        style={[weekStyles.daysRow, { backgroundColor: theme.uiBackground }]}
      >
        {week.map((day) => {
          const isSelected = day.dateString === selectedDay;
          const marking = markedDates[day.dateString];
          const dotVisible = marking?.marked;
          const dotColor = marking?.dotColor || Colors.primary;

          return (
            <TouchableOpacity
              key={day.dateString}
              style={[
                weekStyles.dayCell,
                isSelected && {
                  backgroundColor: marking?.selectedColor || Colors.primary,
                  //
                  elevation: 5,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                },
              ]}
              onPress={() =>
                handleDayPress({
                  dateString: day.dateString,
                  day: 0,
                  month: 0,
                  year: 0,
                  timestamp: 0,
                })
              }
            >
              <ThemedText
                style={[
                  weekStyles.dateText,
                  { color: isSelected ? "white" : theme.text },
                ]}
              >
                {dayjs(day.dateString).date()}
              </ThemedText>
              {dotVisible && (
                <ThemedView
                  style={[weekStyles.dot, { backgroundColor: dotColor }]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ThemedView>
    </ThemedView>
  );
};

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onDateSelect,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const markedDates: { [key: string]: MarkingProps } = {};
  const [isMonthView, setIsMonthView] = useState<boolean>(true);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"] ?? Colors.light;

  appointments.forEach((appt) => {
    const dateString = dayjs(appt.startTime).format("YYYY-MM-DD");
    if (!markedDates[dateString]) {
      markedDates[dateString] = {
        marked: true,
        dotColor: Colors.primary,
      };
    }
  });
  const today = new Date().toISOString().split("T")[0];
  if (!markedDates[today]) {
    markedDates[today] = {
      dotColor: "red",
      marked: true,
    };
  } else {
    markedDates[today] = {
      ...markedDates[today],
      dotColor: "red",
      marked: true,
    };
  }
  if (selectedDay) {
    const existingMarking = markedDates[selectedDay] || {};

    markedDates[selectedDay] = {
      ...existingMarking,
      selected: true,
      selectedColor: Colors.primary,
      selectedTextColor: "white",
    };
  }

  const handleDayPress = (day: DateData) => {
    setSelectedDay(day.dateString);
    onDateSelect(day.dateString);
  };

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: theme.iconColor }]}
    >
      <ThemedView style={[styles.header, { backgroundColor: theme.iconColor }]}>
        {!isMonthView && (
          <ThemedText style={styles.headerTitle}>
            {dayjs(selectedDay).format(isMonthView ? "MMMM YYYY" : "MMMM YYYY")}
          </ThemedText>
        )}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => {
            setIsMonthView(!isMonthView);
            // LayoutAnimation.configureNext(
            //   LayoutAnimation.Presets.easeInEaseOut
            // );
          }}
        >
          <ThemedText
            style={{
              color: Colors.primary,
              fontWeight: "bold",
              alignItems: "center",
            }}
          >
            {isMonthView ? "Скрий" : "Покажи"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {isMonthView ? (
        <CalendarList
          onDayPress={handleDayPress}
          markedDates={markedDates}
          current={selectedDay}
          style={[styles.calendarStyle, { height: 400 }]}
          theme={{
            arrowColor: Colors.primary,
            monthTextColor: Colors.primary,
            todayTextColor: "red",
            calendarBackground: theme.uiBackground,
            dayTextColor: theme.text,
            selectedDayBackgroundColor: "red",
            textDisabledColor: theme.iconColor,
          }}
        />
      ) : (
        <CustomWeekView
          selectedDay={selectedDay}
          markedDates={markedDates}
          handleDayPress={handleDayPress}
          theme={theme}
        />
      )}
    </ThemedView>
  );
};

const weekStyles = StyleSheet.create({
  weekContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderRadius: 20,
    height: 80,
  },
  dayNamesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    paddingTop: 5,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: "bold",
    width: (width - 30) / 7,
    textAlign: "center",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  dayCell: {
    width: (width - 30) / 7,
    height: 35,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dot: {
    position: "absolute",
    bottom: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  toggleButton: {
    padding: 5,
  },
  calendarStyle: {
    borderRadius: 20,
    overflow: "hidden",
  },
});

export default AppointmentCalendar;
