import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ThemedView from "../../components/ThemendView";
import ThemedText from "../../components/ThemedText";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedButton from "../../components/ThemedButton";
import ImagePickerField from "../../components/ImagePickerField";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest, apiRequestMultipart } from "../../lib/http";
import { Colors } from "../../constants/Colors";

type LocationItem = {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
};

export default function LocationsScreen() {
  const {
    session,
    selectedLocationId,
    setSelectedLocationId,
    themePreference,
    primaryColor,
  } = useAuth();
  const router = useRouter();
  const theme = Colors[themePreference ?? "dark"] ?? Colors.light;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [locations, setLocations] = useState<LocationItem[]>([]);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(
    null,
  );
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationPhone, setLocationPhone] = useState("");
  const [locationEmail, setLocationEmail] = useState("");
  const [locationImageUrl, setLocationImageUrl] = useState("");

  const loadLocations = useCallback(async () => {
    if (!session?.token || !session?.user?.businessId) return;

    try {
      setLoading(true);
      const fetchedLocations = await apiRequest<LocationItem[]>(
        `/api/locations?businessId=${session.user.businessId}`,
        { token: session.token },
      );
      setLocations(Array.isArray(fetchedLocations) ? fetchedLocations : []);
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error ? error.message : "Неуспешно зареждане.",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.token, session?.user?.businessId]);

  useFocusEffect(
    useCallback(() => {
      void loadLocations();
    }, [loadLocations]),
  );

  const openLocationModal = (location?: LocationItem) => {
    if (location) {
      setEditingLocation(location);
      setLocationName(location.name ?? "");
      setLocationAddress(location.address ?? "");
      setLocationCity(location.city ?? "");
      setLocationPhone(location.phone ?? "");
      setLocationEmail(location.email ?? "");
      setLocationImageUrl(location.imageUrl ?? "");
    } else {
      setEditingLocation(null);
      setLocationName("");
      setLocationAddress("");
      setLocationCity("");
      setLocationPhone("");
      setLocationEmail("");
      setLocationImageUrl("");
    }
    setShowLocationModal(true);
  };

  const saveLocation = async () => {
    if (!session?.token) return;
    if (
      !locationName.trim() ||
      !locationAddress.trim() ||
      !locationCity.trim()
    ) {
      Alert.alert("Липсват данни", "Попълни име, адрес и град.");
      return;
    }

    try {
      setSaving(true);
      const endpoint = editingLocation
        ? `/api/locations/${editingLocation._id}`
        : `/api/locations`;
      const method = editingLocation ? "PUT" : ("POST" as "PUT" | "POST");
      const locationPayload = {
        name: locationName.trim(),
        address: locationAddress.trim(),
        city: locationCity.trim(),
        phone: locationPhone.trim(),
        email: locationEmail.trim(),
        country: "България",
      };

      if (locationImageUrl.startsWith("file://")) {
        setUploadingImage(true);
        await apiRequestMultipart(endpoint, locationImageUrl, locationPayload, {
          token: session.token,
          method,
        });
        setUploadingImage(false);
      } else {
        await apiRequest(endpoint, {
          token: session.token,
          method,
          body: {
            ...locationPayload,
            imageUrl: locationImageUrl.trim(),
          },
        });
      }

      setShowLocationModal(false);
      await loadLocations();
      Alert.alert(
        "Готово",
        editingLocation ? "Локацията е обновена." : "Локацията е създадена.",
      );
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error ? error.message : "Неуспешно запазване.",
      );
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  };

  const deleteLocation = async (location: LocationItem) => {
    if (!session?.token) return;
    Alert.alert(
      "Изтрий локация",
      `Сигурен ли си, че искаш да изтриеш „${location.name}"?`,
      [
        { text: "Отказ", style: "cancel" },
        {
          text: "Изтрий",
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequest(`/api/locations/${location._id}`, {
                token: session.token,
                method: "DELETE",
              });
              if (selectedLocationId === location._id) {
                setSelectedLocationId(null);
              }
              await loadLocations();
            } catch (error) {
              Alert.alert(
                "Грешка",
                error instanceof Error ? error.message : "Delete failed",
              );
            }
          },
        },
      ],
    );
  };

  const selectLocation = (locationId: string) => {
    setSelectedLocationId(locationId);
    router.replace("/(dashboar)/dashboard");
  };

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <ScrollView>
          {locations.map((location) => {
            const isSelected = selectedLocationId === location._id;
            return (
              <Pressable
                key={location._id}
                onPress={() => selectLocation(location._id)}
                style={[
                  styles.locationCard,
                  {
                    borderColor: isSelected ? primaryColor : "transparent",
                    backgroundColor: theme.uiBackground,
                  },
                ]}
              >
                <View style={styles.mapArea}>
                  <View style={styles.gridLayer}>
                    {Array.from({ length: 36 }).map((_, index) => (
                      <View key={index} style={styles.gridCell} />
                    ))}
                  </View>

                  <View style={styles.cardActionOverlay}>
                    <Pressable
                      style={styles.iconBtn}
                      onPress={(event) => {
                        event.stopPropagation();
                        openLocationModal(location);
                      }}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={theme.text}
                      />
                    </Pressable>
                    <Pressable
                      style={styles.iconBtn}
                      onPress={(event) => {
                        event.stopPropagation();
                        void deleteLocation(location);
                      }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={Colors.warning}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.pinWrap}>
                    <Ionicons
                      name="location-sharp"
                      size={34}
                      color={primaryColor}
                    />
                  </View>

                  <View style={styles.addressChip}>
                    <View style={styles.addressTextWrap}>
                      <ThemedText style={styles.locationName} numberOfLines={1}>
                        {location.name}
                      </ThemedText>
                      <ThemedText
                        style={styles.locationAddress}
                        numberOfLines={1}
                      >
                        {[location.address, location.city]
                          .filter(Boolean)
                          .join(", ")}
                      </ThemedText>
                    </View>

                    <View style={styles.mapThumbWrap}>
                      {location.imageUrl ? (
                        <Image
                          source={{ uri: location.imageUrl }}
                          style={styles.mapThumbImage}
                        />
                      ) : (
                        <View style={styles.mapThumbFallback}>
                          <Ionicons
                            name="business-outline"
                            size={16}
                            color="#fff"
                          />
                          <ThemedText style={styles.mapThumbInitials}>
                            {(location.name || "L").slice(0, 2).toUpperCase()}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>

                  {isSelected ? (
                    <View
                      style={[
                        styles.selectedBadge,
                        { backgroundColor: primaryColor },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="white"
                      />
                      <ThemedText style={styles.selectedBadgeText}>
                        Selected
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}

          <ThemedButton
            style={[styles.addButton, { backgroundColor: primaryColor }]}
            onPress={() => openLocationModal()}
          >
            <ThemedText style={styles.addButtonText}>+ Add location</ThemedText>
          </ThemedButton>
        </ScrollView>
      )}

      <Modal visible={showLocationModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalCard}>
            <ThemedText title={true} style={styles.modalTitle}>
              {editingLocation ? "Edit location" : "Add location"}
            </ThemedText>
            <ScrollView>
              <ImagePickerField
                label="Image"
                value={locationImageUrl}
                onChange={setLocationImageUrl}
                uploading={uploadingImage}
              />
              <ThemedText style={styles.label}>Name</ThemedText>
              <ThemedTextInput
                value={locationName}
                onChangeText={setLocationName}
              />
              <ThemedText style={styles.label}>Address</ThemedText>
              <ThemedTextInput
                value={locationAddress}
                onChangeText={setLocationAddress}
              />
              <ThemedText style={styles.label}>City</ThemedText>
              <ThemedTextInput
                value={locationCity}
                onChangeText={setLocationCity}
              />
              <ThemedText style={styles.label}>Phone</ThemedText>
              <ThemedTextInput
                value={locationPhone}
                onChangeText={setLocationPhone}
              />
              <ThemedText style={styles.label}>Email</ThemedText>
              <ThemedTextInput
                value={locationEmail}
                onChangeText={setLocationEmail}
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <ThemedButton
                style={styles.smallBtn}
                onPress={() => setShowLocationModal(false)}
              >
                <ThemedText style={styles.btnText}>Cancel</ThemedText>
              </ThemedButton>
              <ThemedButton
                style={styles.smallBtn}
                onPress={() => void saveLocation()}
                disabled={saving}
              >
                <ThemedText style={styles.btnText}>
                  {saving ? "Saving..." : "Save"}
                </ThemedText>
              </ThemedButton>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12 },
  locationCard: {
    borderWidth: 3,
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",
  },
  mapArea: {
    height: 230,
    position: "relative",
    backgroundColor: "#1f1b2d",
  },
  gridLayer: {
    position: "absolute",
    inset: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    opacity: 0.3,
  },
  gridCell: {
    width: "16.66%",
    height: "16.66%",
    borderWidth: 0.7,
    borderColor: "rgba(255,255,255,0.14)",
  },
  pinWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -16 }, { translateY: -24 }],
  },
  mapThumbWrap: {
    width: 62,
    height: 62,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.88)",
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.3)",
    marginLeft: 12,
    flexShrink: 0,
  },
  mapThumbImage: {
    width: "100%",
    height: "100%",
  },
  mapThumbFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#36255e",
    gap: 2,
  },
  mapThumbInitials: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  addressChip: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 16,
    backgroundColor: "rgba(0,0,0,0.72)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  addressTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  locationName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  locationAddress: {
    marginTop: 2,
    fontSize: 16,
    color: "#fff",
    opacity: 0.95,
  },
  selectedBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  selectedBadgeText: { color: "white", fontWeight: "700" },
  cardActionOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 2,
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  addButton: {
    marginTop: 4,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 14,
  },
  addButtonText: { color: "white", fontWeight: "700" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 14,
    maxHeight: "88%",
  },
  modalTitle: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  label: { marginTop: 10, marginBottom: 6, fontWeight: "600" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  smallBtn: { flex: 1 },
  btnText: { textAlign: "center", fontWeight: "700", color: "white" },
});
