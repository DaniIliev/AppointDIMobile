import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import ThemedView from "../../components/ThemendView";
import ThemedText from "../../components/ThemedText";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest } from "../../lib/http";
import ThemedCard from "../../components/ThemedCard";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/bg";
import { Colors } from "../../constants/Colors";

dayjs.locale("bg");

type HomeAppointment = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  clientName: string;
  status?: string;
};

type ApiAppointment = {
  _id: string;
  serviceName?: string;
  clientName?: string;
  appointmentTime: {
    start: string;
    end: string;
  };
  status?: string;
};

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const CHART_TRACK_HEIGHT = 100;

const getWeekStart = (date: dayjs.Dayjs) =>
  date.startOf("day").subtract((date.day() + 6) % 7, "day");

export default function HomeScreen() {
  const { session, themePreference, primaryColor } = useAuth();
  const [appointments, setAppointments] = useState<HomeAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const resolvedScheme = themePreference ?? "dark";
  const colorScheme =
    resolvedScheme === "dark" || resolvedScheme === "light"
      ? resolvedScheme
      : "dark";
  const theme = Colors[colorScheme] ?? Colors.light;

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

      setAppointments(
        list.map((item) => ({
          id: item._id,
          title: item.serviceName || "Appointment",
          startTime: new Date(item.appointmentTime.start),
          endTime: new Date(item.appointmentTime.end),
          clientName: item.clientName || "Клиент",
          status: item.status,
        })),
      );
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

  const summary = useMemo(() => {
    const now = dayjs();
    const weekStart = getWeekStart(now);
    const weekEnd = weekStart.add(6, "day").endOf("day");
    const upcoming = appointments
      .filter(
        (item) =>
          dayjs(item.startTime).isAfter(now) && item.status !== "cancelled",
      )
      .sort(
        (left, right) => left.startTime.getTime() - right.startTime.getTime(),
      );

    const nextUpcoming = upcoming[0] ?? null;
    const weekAppointments = appointments.filter((item) => {
      const start = dayjs(item.startTime);
      return (
        (start.isAfter(weekStart) || start.isSame(weekStart)) &&
        (start.isBefore(weekEnd) || start.isSame(weekEnd)) &&
        item.status !== "cancelled"
      );
    });

    const completedWeek = weekAppointments.filter(
      (item) => item.status === "completed",
    ).length;
    const todayAppointments = appointments.filter(
      (item) =>
        dayjs(item.startTime).format("YYYY-MM-DD") === now.format("YYYY-MM-DD"),
    ).length;
    const pendingWeek = Math.max(weekAppointments.length - completedWeek, 0);

    const chartData = WEEKDAY_LABELS.map((label, index) => {
      const dayStart = weekStart.add(index, "day");
      const dayItems = weekAppointments.filter(
        (item) =>
          dayjs(item.startTime).format("YYYY-MM-DD") ===
          dayStart.format("YYYY-MM-DD"),
      );
      const completed = dayItems.filter(
        (item) => item.status === "completed",
      ).length;

      return {
        label,
        total: dayItems.length,
        completed,
      };
    });

    return {
      nextUpcoming,
      weekTotal: weekAppointments.length,
      completedWeek,
      todayAppointments,
      pendingWeek,
      chartData,
      maxDayTotal: Math.max(1, ...chartData.map((item) => item.total)),
    };
  }, [appointments]);

  const nextAppointmentSubtitle = summary.nextUpcoming
    ? `${dayjs(summary.nextUpcoming.startTime).format("dddd, D MMM • HH:mm")} · ${summary.nextUpcoming.clientName}`
    : "Няма следващ записан час";

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.heroCard, { backgroundColor: primaryColor }]}>
            <View style={styles.heroHeaderRow}>
              <View style={styles.heroHeaderTextWrap}>
                <ThemedText style={styles.heroEyebrow}>Overview</ThemedText>
                <ThemedText style={styles.heroTitle}>
                  {summary.nextUpcoming?.title || "Спокойна седмица"}
                </ThemedText>
                <ThemedText style={styles.heroSubtitle}>
                  {nextAppointmentSubtitle}
                </ThemedText>
              </View>
              <Pressable
                style={styles.refreshIconBtn}
                onPress={() => void fetchAppointments()}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={Colors.dark.iconColorFocused}
                />
              </Pressable>
            </View>

            <View style={styles.heroFooterRow}>
              <View style={styles.heroPill}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={Colors.dark.iconColorFocused}
                />
                <ThemedText style={styles.heroPillText}>
                  {summary.nextUpcoming
                    ? `${Math.max(0, dayjs(summary.nextUpcoming.startTime).diff(dayjs(), "minute"))} мин до старта`
                    : "Няма чакащи"}
                </ThemedText>
              </View>
              <View style={styles.heroPill}>
                <Ionicons
                  name="stats-chart-outline"
                  size={14}
                  color={Colors.dark.iconColorFocused}
                />
                <ThemedText style={styles.heroPillText}>
                  {summary.weekTotal} за седмицата
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <ThemedCard
              style={[
                styles.metricCard,
                { backgroundColor: theme.uiBackground },
              ]}
            >
              <ThemedText style={styles.metricLabel}>This week</ThemedText>
              <ThemedText style={[styles.metricValue, { color: primaryColor }]}>
                {summary.weekTotal}
              </ThemedText>
              <ThemedText style={styles.metricHint}>общо</ThemedText>
            </ThemedCard>
            <ThemedCard
              style={[
                styles.metricCard,
                { backgroundColor: theme.uiBackground },
              ]}
            >
              <ThemedText style={styles.metricLabel}>Completed</ThemedText>
              <ThemedText style={[styles.metricValue, { color: primaryColor }]}>
                {summary.completedWeek}
              </ThemedText>
              <ThemedText style={styles.metricHint}>приключени</ThemedText>
            </ThemedCard>
            <ThemedCard
              style={[
                styles.metricCard,
                { backgroundColor: theme.uiBackground },
              ]}
            >
              <ThemedText style={styles.metricLabel}>Today</ThemedText>
              <ThemedText style={[styles.metricValue, { color: primaryColor }]}>
                {summary.todayAppointments}
              </ThemedText>
              <ThemedText style={styles.metricHint}>часа днес</ThemedText>
            </ThemedCard>
          </View>

          <ThemedCard
            style={[styles.chartCard, { backgroundColor: theme.uiBackground }]}
          >
            <View style={styles.sectionHeader}>
              <View>
                <ThemedText style={styles.sectionTitle}>
                  Weekly pulse
                </ThemedText>
                <ThemedText style={styles.sectionSubtitle}>
                  Total vs completed по дни
                </ThemedText>
              </View>
              <View
                style={[
                  styles.summaryBadge,
                  { backgroundColor: theme.background },
                ]}
              >
                <ThemedText
                  style={[styles.summaryBadgeText, { color: primaryColor }]}
                >
                  {summary.pendingWeek} pending
                </ThemedText>
              </View>
            </View>

            <View style={styles.chartWrap}>
              {summary.chartData.map((item) => {
                const totalHeight =
                  (item.total / summary.maxDayTotal) * CHART_TRACK_HEIGHT;
                const completedHeight =
                  item.total === 0
                    ? 0
                    : (item.completed / item.total) * totalHeight;

                return (
                  <View key={item.label} style={styles.chartColumn}>
                    <ThemedText style={styles.chartValue}>
                      {item.total}
                    </ThemedText>
                    <View
                      style={[
                        styles.chartTrack,
                        { backgroundColor: theme.background },
                      ]}
                    >
                      <View
                        style={[
                          styles.chartTotalBar,
                          {
                            height: totalHeight,
                            backgroundColor: `${primaryColor}55`,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.chartCompletedBar,
                            {
                              height: completedHeight,
                              backgroundColor: primaryColor,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <ThemedText style={styles.chartLabel}>
                      {item.label}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </ThemedCard>

          <ThemedCard
            style={[styles.infoCard, { backgroundColor: theme.uiBackground }]}
          >
            <View style={styles.sectionHeader}>
              <View>
                <ThemedText style={styles.sectionTitle}>
                  What matters now
                </ThemedText>
                <ThemedText style={styles.sectionSubtitle}>
                  Бърз поглед върху седмицата ти
                </ThemedText>
              </View>
            </View>

            <View style={styles.insightRow}>
              <View
                style={[
                  styles.insightIconWrap,
                  { backgroundColor: theme.background },
                ]}
              >
                <Ionicons name="flash-outline" size={18} color={primaryColor} />
              </View>
              <View style={styles.insightTextWrap}>
                <ThemedText style={styles.insightTitle}>Next up</ThemedText>
                <ThemedText style={styles.insightText}>
                  {summary.nextUpcoming
                    ? `${summary.nextUpcoming.clientName} за ${summary.nextUpcoming.title}`
                    : "Няма предстоящи appointments в момента."}
                </ThemedText>
              </View>
            </View>

            <View style={styles.insightRow}>
              <View
                style={[
                  styles.insightIconWrap,
                  { backgroundColor: theme.background },
                ]}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={18}
                  color={primaryColor}
                />
              </View>
              <View style={styles.insightTextWrap}>
                <ThemedText style={styles.insightTitle}>Completion</ThemedText>
                <ThemedText style={styles.insightText}>
                  {summary.weekTotal > 0
                    ? `${Math.round((summary.completedWeek / summary.weekTotal) * 100)}% от седмичните часове са completed.`
                    : "Все още няма appointments за тази седмица."}
                </ThemedText>
              </View>
            </View>
          </ThemedCard>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: {
    marginTop: 24,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 28,
  },
  heroCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
  },
  heroHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  heroHeaderTextWrap: {
    flex: 1,
  },
  heroEyebrow: {
    color: Colors.dark.iconColorFocused,
    opacity: 0.82,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroTitle: {
    color: Colors.dark.iconColorFocused,
    fontSize: 22,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: Colors.dark.iconColorFocused,
    opacity: 0.92,
    marginTop: 8,
    lineHeight: 20,
  },
  refreshIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroFooterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  heroPillText: {
    color: Colors.dark.iconColorFocused,
    fontWeight: "700",
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.72,
    marginBottom: 10,
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  metricHint: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.72,
  },
  chartCard: {
    borderRadius: 22,
    marginBottom: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  sectionSubtitle: {
    marginTop: 4,
    opacity: 0.7,
    fontSize: 12,
  },
  summaryBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  summaryBadgeText: {
    fontWeight: "700",
    fontSize: 12,
  },
  chartWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 150,
    gap: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartValue: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 6,
    fontWeight: "700",
  },
  chartTrack: {
    width: 24,
    height: CHART_TRACK_HEIGHT,
    borderRadius: 12,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartTotalBar: {
    width: "100%",
    justifyContent: "flex-end",
    borderRadius: 12,
    overflow: "hidden",
  },
  chartCompletedBar: {
    width: "100%",
    borderRadius: 12,
  },
  chartLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "700",
  },
  infoCard: {
    borderRadius: 22,
    padding: 16,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  insightIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  insightTextWrap: {
    flex: 1,
  },
  insightTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },
  insightText: {
    opacity: 0.76,
    lineHeight: 20,
  },
});
