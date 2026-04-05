import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import ThemedView from "../../../components/ThemendView";
import ThemedButton from "../../../components/ThemedButton";
import ThemedText from "../../../components/ThemedText";
import ThemedTextInput from "../../../components/ThemedTextInput";
import { styles } from "../business.styles";

type Props = {
  context: any;
};

export function BusinessScheduleSection({ context }: Props) {
  return (
    <View>
      {/* Full-width add button — same style as locations */}
      <Pressable
        style={[ss.addBtn, { backgroundColor: context.primaryColor }]}
        onPress={() => context.setShowScheduleCreateModal(true)}
      >
        <Ionicons name="add" size={18} color="#fff" />
        <ThemedText style={ss.addBtnText}>Нов график</ThemedText>
      </Pressable>

      {/* Schedule cards */}
      {context.schedules.length === 0 && (
        <View
          style={[
            ss.emptyCard,
            { backgroundColor: context.theme.uiBackground },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={32}
            color={context.theme.iconColor}
            style={{ opacity: 0.4 }}
          />
          <ThemedText style={ss.emptyText}>Няма добавени графици</ThemedText>
        </View>
      )}
      {context.schedules.map((schedule: any) => {
        const startDate = String(schedule.startDate).split("T")[0];
        const endDate = String(schedule.endDate).split("T")[0];
        const workStart = schedule.workTime?.start || "--:--";
        const workEnd = schedule.workTime?.end || "--:--";
        return (
          <View
            key={schedule._id}
            style={[
              ss.scheduleCard,
              { backgroundColor: context.theme.uiBackground },
            ]}
          >
            {/* Date range row */}
            <View style={ss.dateRow}>
              <View
                style={[
                  ss.dateBadge,
                  { backgroundColor: context.primaryColor + "22" },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color={context.primaryColor}
                />
                <ThemedText style={ss.dateBadgeText}>{startDate}</ThemedText>
              </View>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={context.primaryColor}
                style={{ opacity: 0.5 }}
              />
              <View
                style={[
                  ss.dateBadge,
                  { backgroundColor: context.primaryColor + "22" },
                ]}
              >
                <ThemedText style={ss.dateBadgeText}>{endDate}</ThemedText>
              </View>
              <View style={ss.infoRow}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={context.theme.iconColor}
                />
                <ThemedText style={ss.infoText}>
                  {workStart} – {workEnd}
                </ThemedText>
              </View>
            </View>

            {/* Action row */}
            <View style={ss.cardFooter}>
              <Pressable
                style={[
                  ss.iconAction,
                  { backgroundColor: context.theme.navBackground },
                ]}
                onPress={() => void context.openScheduleDetails(schedule)}
              >
                <Ionicons
                  name="calendar"
                  size={16}
                  color={context.primaryColor}
                />
                <ThemedText
                  style={[ss.iconActionText, { color: context.primaryColor }]}
                >
                  Календар
                </ThemedText>
              </Pressable>
            </View>
          </View>
        );
      })}

      <Modal
        visible={context.showScheduleCreateModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalCard}>
            <ScrollView>
              <ThemedText title={true} style={styles.modalTitle}>
                Добави график
              </ThemedText>

              <ThemedText style={styles.label}>От дата (YYYY-MM-DD)</ThemedText>
              <ThemedTextInput
                value={context.scheduleStartDate}
                onChangeText={context.setScheduleStartDate}
                placeholder="2026-04-03"
              />

              <ThemedText style={styles.label}>До дата (YYYY-MM-DD)</ThemedText>
              <ThemedTextInput
                value={context.scheduleEndDate}
                onChangeText={context.setScheduleEndDate}
                placeholder="2026-12-31"
              />

              <ThemedText style={styles.label}>Работно време от</ThemedText>
              <ThemedTextInput
                value={context.workStart}
                onChangeText={context.setWorkStart}
                placeholder="09:00"
              />

              <ThemedText style={styles.label}>Работно време до</ThemedText>
              <ThemedTextInput
                value={context.workEnd}
                onChangeText={context.setWorkEnd}
                placeholder="18:00"
              />

              <ThemedText style={styles.subLabel}>Почивка 1</ThemedText>
              <ThemedTextInput
                value={context.break1Start}
                onChangeText={context.setBreak1Start}
                placeholder="start (12:00)"
              />
              <ThemedTextInput
                value={context.break1End}
                onChangeText={context.setBreak1End}
                placeholder="end (13:00)"
              />

              <ThemedText style={styles.subLabel}>Почивка 2</ThemedText>
              <ThemedTextInput
                value={context.break2Start}
                onChangeText={context.setBreak2Start}
                placeholder="start"
              />
              <ThemedTextInput
                value={context.break2End}
                onChangeText={context.setBreak2End}
                placeholder="end"
              />

              <ThemedText style={styles.subLabel}>Почивка 3</ThemedText>
              <ThemedTextInput
                value={context.break3Start}
                onChangeText={context.setBreak3Start}
                placeholder="start"
              />
              <ThemedTextInput
                value={context.break3End}
                onChangeText={context.setBreak3End}
                placeholder="end"
              />

              <ThemedText style={styles.subLabel}>
                Седмични почивни дни
              </ThemedText>
              {Object.keys(context.dayOffMap).map((dayKey) => (
                <View key={dayKey} style={styles.switchRow}>
                  <ThemedText style={styles.capitalize}>{dayKey}</ThemedText>
                  <Switch
                    value={context.dayOffMap[dayKey]}
                    onValueChange={(value) =>
                      context.setDayOffMap((previous: any) => ({
                        ...previous,
                        [dayKey]: value,
                      }))
                    }
                  />
                </View>
              ))}

              <View style={styles.switchRow}>
                <ThemedText>Apply to all staff</ThemedText>
                <Switch
                  value={context.applyToAllStaff}
                  onValueChange={context.setApplyToAllStaff}
                />
              </View>

              <View style={styles.modalActions}>
                <ThemedButton
                  style={styles.smallBtn}
                  onPress={() => context.setShowScheduleCreateModal(false)}
                >
                  <ThemedText style={styles.btnText}>Cancel</ThemedText>
                </ThemedButton>
                <ThemedButton
                  style={styles.smallBtn}
                  onPress={() => void context.createSchedule()}
                  disabled={context.savingSchedule}
                >
                  <ThemedText style={styles.btnText}>
                    {context.savingSchedule ? "Saving..." : "Save"}
                  </ThemedText>
                </ThemedButton>
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>

      <Modal
        visible={context.showScheduleDetailsModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalCardWide}>
            <ThemedText title={true} style={styles.modalTitle}>
              Детайлен календар
            </ThemedText>

            {context.savingDayDetails &&
            context.scheduleDetails.length === 0 ? (
              <ActivityIndicator style={{ marginTop: 16 }} />
            ) : (
              <>
                <Calendar
                  markedDates={context.markedDates}
                  onDayPress={(day) =>
                    context.setSelectedDateKey(day.dateString)
                  }
                />

                {context.selectedDetailDay ? (
                  <ScrollView style={{ marginTop: 10 }}>
                    <ThemedText style={styles.subLabel}>
                      Ден: {context.selectedDateKey}
                    </ThemedText>

                    <View style={styles.switchRow}>
                      <ThemedText>Почивен ден</ThemedText>
                      <Switch
                        value={context.selectedDetailDay.isDayOff}
                        onValueChange={(value) => {
                          if (value) {
                            context.updateSelectedDay({
                              isDayOff: true,
                              workTime: null,
                              breaks: [],
                            });
                          } else {
                            context.updateSelectedDay({
                              isDayOff: false,
                              workTime: {
                                start:
                                  context.selectedDetailDay.workTime?.start ||
                                  "09:00",
                                end:
                                  context.selectedDetailDay.workTime?.end ||
                                  "18:00",
                              },
                            });
                          }
                        }}
                      />
                    </View>

                    {!context.selectedDetailDay.isDayOff && (
                      <>
                        <ThemedText style={styles.label}>
                          Работно време от
                        </ThemedText>
                        <ThemedTextInput
                          value={
                            context.selectedDetailDay.workTime?.start || ""
                          }
                          onChangeText={(value) =>
                            context.updateSelectedDay({
                              workTime: {
                                start: value,
                                end:
                                  context.selectedDetailDay.workTime?.end || "",
                              },
                            })
                          }
                        />
                        <ThemedText style={styles.label}>
                          Работно време до
                        </ThemedText>
                        <ThemedTextInput
                          value={context.selectedDetailDay.workTime?.end || ""}
                          onChangeText={(value) =>
                            context.updateSelectedDay({
                              workTime: {
                                start:
                                  context.selectedDetailDay.workTime?.start ||
                                  "",
                                end: value,
                              },
                            })
                          }
                        />

                        <ThemedText style={styles.label}>
                          Почивки (до 3)
                        </ThemedText>
                        {[0, 1, 2].map((breakIndex) => (
                          <View key={breakIndex} style={styles.breakRow}>
                            <ThemedTextInput
                              style={styles.breakInput}
                              value={
                                context.selectedDetailDay.breaks[breakIndex]
                                  ?.start || ""
                              }
                              placeholder="start"
                              onChangeText={(value) => {
                                const nextBreaks = [
                                  ...context.selectedDetailDay.breaks,
                                ];
                                nextBreaks[breakIndex] = {
                                  start: value,
                                  end: nextBreaks[breakIndex]?.end || "",
                                };
                                context.updateSelectedDay({
                                  breaks: nextBreaks,
                                });
                              }}
                            />
                            <ThemedTextInput
                              style={styles.breakInput}
                              value={
                                context.selectedDetailDay.breaks[breakIndex]
                                  ?.end || ""
                              }
                              placeholder="end"
                              onChangeText={(value) => {
                                const nextBreaks = [
                                  ...context.selectedDetailDay.breaks,
                                ];
                                nextBreaks[breakIndex] = {
                                  start: nextBreaks[breakIndex]?.start || "",
                                  end: value,
                                };
                                context.updateSelectedDay({
                                  breaks: nextBreaks,
                                });
                              }}
                            />
                          </View>
                        ))}
                      </>
                    )}
                  </ScrollView>
                ) : (
                  <ThemedText style={styles.emptyHint}>
                    Избери ден от календара.
                  </ThemedText>
                )}

                <View style={styles.modalActions}>
                  <ThemedButton
                    style={styles.smallBtn}
                    onPress={() => context.setShowScheduleDetailsModal(false)}
                  >
                    <ThemedText style={styles.btnText}>Close</ThemedText>
                  </ThemedButton>
                  <ThemedButton
                    style={styles.smallBtn}
                    onPress={() => void context.saveDayDetails()}
                    disabled={context.savingDayDetails}
                  >
                    <ThemedText style={styles.btnText}>
                      {context.savingDayDetails ? "Saving..." : "Save day"}
                    </ThemedText>
                  </ThemedButton>
                </View>
              </>
            )}
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const ss = StyleSheet.create({
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 14,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  emptyText: {
    opacity: 0.45,
    fontSize: 13,
  },
  scheduleCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 2,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.75,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  iconAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  iconActionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  addButton: {
    marginTop: 4,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 14,
  },
  addButtonText: { color: "white", fontWeight: "700" },
});
