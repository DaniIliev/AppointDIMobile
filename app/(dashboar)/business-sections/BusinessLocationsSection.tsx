import React from "react";
import { Image, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemedButton from "../../../components/ThemedButton";
import ThemedText from "../../../components/ThemedText";
import { Colors } from "../../../constants/Colors";
import { styles } from "../business.styles";

type Props = {
  context: any;
};

export function BusinessLocationsSection({ context }: Props) {
  return (
    <View>
      <ThemedButton
        style={styles.actionButton}
        onPress={() => context.openLocationModal()}
      >
        <ThemedText style={styles.btnText}>+ Add location</ThemedText>
      </ThemedButton>
      {context.locations.map((location: any) => (
        <View
          key={location._id}
          style={[styles.card, { backgroundColor: context.theme.uiBackground }]}
        >
          <View style={styles.cardRow}>
            {location.imageUrl ? (
              <Image
                source={{ uri: location.imageUrl }}
                style={styles.cardThumb}
              />
            ) : (
              <View style={styles.cardThumbPlaceholder}>
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={context.theme.iconColor}
                />
              </View>
            )}
            <View style={styles.cardBody}>
              <ThemedText style={styles.cardTitle}>{location.name}</ThemedText>
              <ThemedText numberOfLines={1}>
                {[location.address, location.city].filter(Boolean).join(", ") ||
                  "-"}
              </ThemedText>
              {!!location.phone && (
                <ThemedText numberOfLines={1}>{location.phone}</ThemedText>
              )}
            </View>
          </View>
          <View style={styles.inlineActions}>
            <Pressable
              style={[
                styles.menuTriggerBtn,
                { backgroundColor: context.theme.navBackground },
              ]}
              onPress={() =>
                context.setOpenActionMenu((previous: string | null) =>
                  previous === `location-${location._id}`
                    ? null
                    : `location-${location._id}`,
                )
              }
            >
              <Ionicons
                name="settings-outline"
                size={18}
                color={context.theme.text}
              />
            </Pressable>
            {context.openActionMenu === `location-${location._id}` ? (
              <View
                style={[
                  styles.iconActionsMenu,
                  { backgroundColor: context.theme.navBackground },
                ]}
              >
                <Pressable
                  style={styles.iconOnlyAction}
                  onPress={() => {
                    context.setViewLocation(location);
                    context.setShowLocationViewModal(true);
                    context.setOpenActionMenu(null);
                  }}
                >
                  <Ionicons
                    name="eye-outline"
                    size={17}
                    color={context.theme.text}
                  />
                </Pressable>
                <Pressable
                  style={styles.iconOnlyAction}
                  onPress={() => {
                    context.openLocationModal(location);
                    context.setOpenActionMenu(null);
                  }}
                >
                  <Ionicons
                    name="create-outline"
                    size={17}
                    color={context.theme.text}
                  />
                </Pressable>
                <Pressable
                  style={[
                    styles.iconOnlyAction,
                    { backgroundColor: context.theme.background },
                  ]}
                  onPress={() => {
                    context.confirmDeleteLocation(location);
                    context.setOpenActionMenu(null);
                  }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color={Colors.warning}
                  />
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}
