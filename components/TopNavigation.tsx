import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemendView";
import { Colors } from "../constants/Colors";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../lib/http";

type AlertItem = {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: "appointment" | string;
  appointment?: {
    _id: string;
    clientName?: string;
    appointmentTime?: { start?: string; end?: string };
  } | null;
};

type TopNavigationProps = {
  title?: string;
};

export default function TopNavigation({ title }: TopNavigationProps) {
  const {
    session,
    logout,
    selectedLocation,
    selectedLocationId,
    setSelectedLocationId,
    primaryColor,
    themePreference,
  } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isConfirmingAll, setIsConfirmingAll] = useState(false);
  const colorScheme = themePreference ?? "dark";
  const theme = Colors[colorScheme] ?? Colors.light;
  const onPrimaryColor = Colors.dark.iconColorFocused;
  const destructiveColor = Colors.warning;

  const fullName = useMemo(() => {
    const first = session?.user?.firstName ?? "";
    const last = session?.user?.lastName ?? "";
    return `${first} ${last}`.trim() || session?.user?.email || "User";
  }, [session?.user]);

  const unreadCount = alerts.filter((item) => !item.isRead).length;

  const fetchAlerts = useCallback(async () => {
    if (!session?.token) return;

    try {
      const result = await apiRequest<AlertItem[]>("/api/alerts", {
        token: session.token,
      });
      setAlerts(result);
    } catch {
      setAlerts([]);
    }
  }, [session?.token]);

  useFocusEffect(
    useCallback(() => {
      void fetchAlerts();
    }, [fetchAlerts]),
  );

  const markAsRead = async (alertId: string) => {
    if (!session?.token) return;

    try {
      await apiRequest(`/api/alerts/${alertId}/read`, {
        token: session.token,
        method: "PUT",
      });
      setAlerts((previous) =>
        previous.map((item) =>
          item._id === alertId ? { ...item, isRead: true } : item,
        ),
      );
    } catch {
      return;
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!session?.token) return;
    try {
      await apiRequest(`/api/alerts/${alertId}`, {
        token: session.token,
        method: "DELETE",
      });
      setAlerts((previous) => previous.filter((item) => item._id !== alertId));
    } catch {
      return;
    }
  };

  const updateAppointmentStatusFromAlert = async (
    alert: AlertItem,
    status: "confirmed" | "cancelled",
  ) => {
    if (!session?.token || !alert.appointment?._id) return;
    try {
      await apiRequest(`/api/appointment/${alert.appointment._id}/status`, {
        token: session.token,
        method: "PUT",
        body: { status },
      });
      await deleteAlert(alert._id);
    } catch {
      return;
    }
  };

  const confirmAllAppointments = async () => {
    if (!session?.token) return;

    const appointmentAlerts = alerts.filter(
      (item) => item.type === "appointment" && item.appointment?._id,
    );

    if (appointmentAlerts.length === 0) {
      return;
    }

    try {
      setIsConfirmingAll(true);
      for (const alert of appointmentAlerts) {
        if (!alert.appointment?._id) continue;
        await apiRequest(`/api/appointment/${alert.appointment._id}/status`, {
          token: session.token,
          method: "PUT",
          body: { status: "confirmed" },
        });
        await apiRequest(`/api/alerts/${alert._id}`, {
          token: session.token,
          method: "DELETE",
        });
      }
      setAlerts((previous) =>
        previous.filter(
          (item) => !(item.type === "appointment" && item.appointment?._id),
        ),
      );
    } catch {
      return;
    } finally {
      setIsConfirmingAll(false);
    }
  };

  return (
    <View style={[styles.safeAreaFill, { backgroundColor: primaryColor }]}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: primaryColor }}>
        <ThemedView style={[styles.wrapper, { backgroundColor: primaryColor }]}>
          <View style={styles.row}>
            <View>
              <ThemedText style={[styles.greeting, { color: onPrimaryColor }]}>
                Hi, {fullName}
              </ThemedText>
              {!!title && (
                <ThemedText style={[styles.title, { color: onPrimaryColor }]}>
                  {title}
                </ThemedText>
              )}
              {selectedLocation ? (
                <Pressable
                  style={styles.locationRow}
                  onPress={() => {
                    if ((session?.locations?.length ?? 0) > 1) {
                      setShowLocationPicker(true);
                    }
                  }}
                >
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={onPrimaryColor}
                  />
                  <ThemedText
                    style={[styles.locationText, { color: onPrimaryColor }]}
                  >
                    {selectedLocation.name}
                  </ThemedText>
                  {(session?.locations?.length ?? 0) > 1 && (
                    <Ionicons
                      name="chevron-down"
                      size={14}
                      color={onPrimaryColor}
                    />
                  )}
                </Pressable>
              ) : null}
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={() => router.push("/(dashboar)/locations")}
                style={styles.iconButton}
              >
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={theme.iconColorFocused}
                />
              </Pressable>

              <Pressable
                onPress={() => setShowAlerts(true)}
                style={styles.iconButton}
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={theme.iconColorFocused}
                />
                {unreadCount > 0 && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: destructiveColor },
                    ]}
                  >
                    <ThemedText
                      style={[styles.badgeText, { color: onPrimaryColor }]}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </ThemedText>
                  </View>
                )}
              </Pressable>

              <Pressable
                style={styles.iconButton}
                onPress={() => setShowProfileMenu(true)}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={28}
                  color={theme.iconColorFocused}
                />
              </Pressable>
            </View>
          </View>
        </ThemedView>
      </SafeAreaView>

      <Modal visible={showAlerts} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ThemedText title={true} style={styles.modalTitle}>
                Alerts
              </ThemedText>
              <Pressable onPress={() => setShowAlerts(false)}>
                <Ionicons name="close" size={22} color={theme.text} />
              </Pressable>
            </View>

            {alerts.filter(
              (item) => item.type === "appointment" && item.appointment?._id,
            ).length > 0 && (
              <Pressable
                style={[
                  styles.confirmAllBtn,
                  { backgroundColor: primaryColor },
                  isConfirmingAll && styles.confirmAllBtnDisabled,
                ]}
                disabled={isConfirmingAll}
                onPress={() => void confirmAllAppointments()}
              >
                {isConfirmingAll ? (
                  <ActivityIndicator color={onPrimaryColor} size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-done-outline"
                      size={16}
                      color={onPrimaryColor}
                    />
                    <ThemedText
                      style={[styles.confirmAllText, { color: onPrimaryColor }]}
                    >
                      Confirm All
                    </ThemedText>
                  </>
                )}
              </Pressable>
            )}

            {alerts.length === 0 ? (
              <ThemedText style={styles.emptyText}>No alerts</ThemedText>
            ) : (
              alerts.map((item) => (
                <View
                  key={item._id}
                  style={[styles.alertRow, item.isRead && styles.alertRead]}
                >
                  <Pressable onPress={() => void markAsRead(item._id)}>
                    <ThemedText style={styles.alertMessage}>
                      {item.message}
                    </ThemedText>
                    {!!item.appointment?.appointmentTime?.start && (
                      <ThemedText style={styles.alertMetaText}>
                        {new Date(
                          item.appointment.appointmentTime.start,
                        ).toLocaleString("bg-BG")}
                      </ThemedText>
                    )}
                  </Pressable>

                  <View style={styles.alertActions}>
                    {item.type === "appointment" && item.appointment?._id ? (
                      <>
                        <Pressable
                          style={[
                            styles.confirmBtn,
                            { backgroundColor: primaryColor },
                          ]}
                          onPress={() =>
                            void updateAppointmentStatusFromAlert(
                              item,
                              "confirmed",
                            )
                          }
                        >
                          <Ionicons
                            name="checkmark-outline"
                            size={14}
                            color={onPrimaryColor}
                          />
                          <ThemedText
                            style={[
                              styles.alertActionText,
                              { color: onPrimaryColor },
                            ]}
                          >
                            Confirm
                          </ThemedText>
                        </Pressable>
                        <Pressable
                          style={[
                            styles.rejectBtn,
                            { backgroundColor: destructiveColor },
                          ]}
                          onPress={() =>
                            void updateAppointmentStatusFromAlert(
                              item,
                              "cancelled",
                            )
                          }
                        >
                          <Ionicons
                            name="close-outline"
                            size={14}
                            color={onPrimaryColor}
                          />
                          <ThemedText
                            style={[
                              styles.alertActionText,
                              { color: onPrimaryColor },
                            ]}
                          >
                            Reject
                          </ThemedText>
                        </Pressable>
                      </>
                    ) : null}

                    <Pressable
                      style={[
                        styles.deleteAlertBtn,
                        { backgroundColor: theme.background },
                      ]}
                      onPress={() => void deleteAlert(item._id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color={destructiveColor}
                      />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </ThemedView>
        </View>
      </Modal>

      <Modal visible={showLocationPicker} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ThemedText title={true} style={styles.modalTitle}>
                Select location
              </ThemedText>
              <Pressable onPress={() => setShowLocationPicker(false)}>
                <Ionicons name="close" size={22} color={theme.text} />
              </Pressable>
            </View>

            {(session?.locations ?? []).map((location) => {
              const isActive = location._id === selectedLocationId;
              return (
                <Pressable
                  key={location._id}
                  style={[
                    styles.locationOption,
                    isActive && styles.locationOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedLocationId(location._id);
                    setShowLocationPicker(false);
                  }}
                >
                  <ThemedText style={styles.locationOptionText}>
                    {location.name}
                  </ThemedText>
                  {isActive ? (
                    <Ionicons name="checkmark" size={18} color={primaryColor} />
                  ) : null}
                </Pressable>
              );
            })}
          </ThemedView>
        </View>
      </Modal>

      <Modal visible={showProfileMenu} transparent animationType="fade">
        <Pressable
          style={styles.profileMenuBackdrop}
          onPress={() => setShowProfileMenu(false)}
        >
          <ThemedView style={styles.profileMenuCard}>
            <Pressable
              style={styles.profileMenuItem}
              onPress={() => {
                setShowProfileMenu(false);
                router.push("/(dashboar)/profile");
              }}
            >
              <Ionicons name="person-outline" size={18} color={theme.text} />
              <ThemedText style={styles.profileMenuItemText}>
                Profile
              </ThemedText>
            </Pressable>
            <Pressable
              style={styles.profileMenuItem}
              onPress={() => {
                setShowProfileMenu(false);
                void logout();
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color={destructiveColor}
              />
              <ThemedText
                style={[
                  styles.profileMenuItemText,
                  { color: destructiveColor },
                ]}
              >
                Logout
              </ThemedText>
            </Pressable>
          </ThemedView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeAreaFill: {
    marginBottom: 10,
  },
  wrapper: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontWeight: "700",
    fontSize: 16,
  },
  title: {
    marginTop: 2,
    opacity: 0.9,
  },
  locationRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    opacity: 0.95,
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "60%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    opacity: 0.75,
    marginTop: 8,
  },
  confirmAllBtn: {
    marginBottom: 10,
    borderRadius: 8,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  confirmAllBtnDisabled: {
    opacity: 0.6,
  },
  confirmAllText: {
    fontWeight: "700",
  },
  alertRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(120,120,120,0.25)",
  },
  alertRead: {
    opacity: 0.6,
  },
  alertMessage: {
    fontSize: 14,
  },
  alertMetaText: {
    marginTop: 4,
    opacity: 0.75,
    fontSize: 12,
  },
  alertActions: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  confirmBtn: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rejectBtn: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  alertActionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  deleteAlertBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  locationOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(120,120,120,0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationOptionActive: {
    backgroundColor: "rgba(66,133,244,0.08)",
  },
  locationOptionText: {
    fontSize: 15,
    fontWeight: "600",
  },
  profileMenuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 86,
    paddingRight: 16,
  },
  profileMenuCard: {
    width: 170,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  profileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  profileMenuItemText: {
    fontWeight: "600",
  },
});
