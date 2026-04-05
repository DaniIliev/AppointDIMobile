import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import ThemedView from "../../components/ThemendView";
import ThemedText from "../../components/ThemedText";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedButton from "../../components/ThemedButton";
import ImagePickerField from "../../components/ImagePickerField";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest, apiRequestMultipart } from "../../lib/http";

const PRIMARY_OPTIONS = ["#6849a7", "#e91e63", "#3b61c0", "#16a085", "#f59e0b"];

export default function ProfileScreen() {
  const {
    session,
    refreshSessionData,
    themePreference,
    setThemePreference,
    primaryColor,
    setPrimaryColor,
  } = useAuth();

  const [firstName, setFirstName] = useState(session?.user?.firstName ?? "");
  const [lastName, setLastName] = useState(session?.user?.lastName ?? "");
  const [phone, setPhone] = useState(session?.user?.phone ?? "");
  const [avatarUri, setAvatarUri] = useState(
    session?.user?.profilePictureUrl ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const email = useMemo(
    () => session?.user?.email ?? "",
    [session?.user?.email],
  );

  const saveProfile = async () => {
    if (!session?.token || !session?.user?.id) return;

    try {
      setSaving(true);
      await apiRequest(`/api/auth/user/${session.user.id}`, {
        token: session.token,
        method: "PUT",
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          theme: themePreference,
          primaryColor,
        },
      });

      if (avatarUri.startsWith("file://")) {
        setUploading(true);
        await apiRequestMultipart(
          `/api/auth/user/${session.user.id}/picture`,
          avatarUri,
          {},
          {
            token: session.token,
            method: "PUT",
            fileFieldName: "profilePicture",
          },
        );
      }

      await refreshSessionData();
      Alert.alert("Готово", "Профилът е обновен успешно.");
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error ? error.message : "Profile save failed",
      );
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <View style={styles.card}>
          <ThemedText title={true} style={styles.sectionTitle}>
            Account
          </ThemedText>

          <ImagePickerField
            label="Profile image (optional)"
            value={avatarUri}
            onChange={setAvatarUri}
            uploading={uploading}
          />

          <ThemedText style={styles.label}>First Name</ThemedText>
          <ThemedTextInput value={firstName} onChangeText={setFirstName} />

          <ThemedText style={styles.label}>Last Name</ThemedText>
          <ThemedTextInput value={lastName} onChangeText={setLastName} />

          <ThemedText style={styles.label}>Phone</ThemedText>
          <ThemedTextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <ThemedText style={styles.label}>Email</ThemedText>
          <ThemedTextInput value={email} editable={false} />
        </View>

        <View style={styles.card}>
          <ThemedText title={true} style={styles.sectionTitle}>
            Appearance
          </ThemedText>

          <ThemedText style={styles.label}>Mode</ThemedText>
          <View style={styles.row}>
            {(["dark", "light"] as const).map((mode) => (
              <Pressable
                key={mode}
                style={[
                  styles.modeChip,
                  themePreference === mode && styles.modeChipActive,
                ]}
                onPress={() => setThemePreference(mode)}
              >
                <ThemedText style={styles.modeText}>
                  {mode === "dark" ? "Dark" : "Light"}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <ThemedText style={styles.label}>Primary color</ThemedText>
          <View style={styles.row}>
            {PRIMARY_OPTIONS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setPrimaryColor(color)}
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  primaryColor === color && styles.colorDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <ThemedButton
          onPress={() => void saveProfile()}
          disabled={saving || uploading}
        >
          <ThemedText style={styles.btnText}>
            {saving || uploading ? "Saving..." : "Save profile"}
          </ThemedText>
        </ThemedButton>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12 },
  card: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "rgba(130,130,130,0.15)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  modeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(130,130,130,0.2)",
  },
  modeChipActive: {
    borderWidth: 2,
    borderColor: "white",
  },
  modeText: {
    color: "white",
    fontWeight: "700",
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: "white",
  },
  btnText: {
    color: "white",
    fontWeight: "700",
  },
});
