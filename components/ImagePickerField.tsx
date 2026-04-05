import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "./ThemedText";
import { useAuth } from "../hooks/useAuth";
import { Colors } from "../constants/Colors";

type Props = {
  /**
   * The current image URI (either a remote https URL already saved on the backend
   * or a local file:// URI chosen by the user but not yet uploaded).
   */
  value: string;
  /** Called with the local file:// URI after the user picks a photo. */
  onChange: (uri: string) => void;
  /** Optional label shown above the picker. */
  label?: string;
  /** Set to true while an upload is in progress to show a spinner overlay. */
  uploading?: boolean;
};

export default function ImagePickerField({
  value,
  onChange,
  label = "Image",
  uploading = false,
}: Props) {
  const { primaryColor, themePreference } = useAuth();
  const colorScheme = themePreference ?? "dark";
  const theme = Colors[colorScheme] ?? Colors.light;
  const destructiveColor = Colors.warning;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.wrapper}>
      {!!label && <ThemedText style={styles.label}>{label}</ThemedText>}

      <View style={styles.previewRow}>
        {value ? (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: value }}
              style={styles.preview}
              resizeMode="cover"
            />
            {uploading && (
              <View style={styles.spinnerOverlay}>
                <ActivityIndicator color={theme.iconColorFocused} />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={36} color={theme.iconColor} />
          </View>
        )}

        <View style={styles.buttonsCol}>
          <Pressable style={styles.iconBtn} onPress={() => void pickImage()}>
            <Ionicons name="images-outline" size={20} color={primaryColor} />
            <ThemedText style={styles.iconBtnText}>Gallery</ThemedText>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => void takePhoto()}>
            <Ionicons name="camera-outline" size={20} color={primaryColor} />
            <ThemedText style={styles.iconBtnText}>Camera</ThemedText>
          </Pressable>
          {!!value && (
            <Pressable style={styles.iconBtn} onPress={() => onChange("")}>
              <Ionicons
                name="trash-outline"
                size={20}
                color={destructiveColor}
              />
              <ThemedText
                style={[styles.iconBtnText, { color: destructiveColor }]}
              >
                Remove
              </ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  previewContainer: {
    position: "relative",
  },
  preview: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: "rgba(130,130,130,0.15)",
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: "rgba(130,130,130,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(130,130,130,0.3)",
    borderStyle: "dashed",
  },
  buttonsCol: {
    flex: 1,
    gap: 8,
  },
  iconBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(130,130,130,0.1)",
  },
  iconBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
