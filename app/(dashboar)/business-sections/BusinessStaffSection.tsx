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

export function BusinessStaffSection({ context }: Props) {
  return (
    <View>
      <ThemedButton
        style={styles.actionButton}
        onPress={() => context.openStaffModal()}
      >
        <ThemedText style={styles.btnText}>+ Invite staff</ThemedText>
      </ThemedButton>
      {context.staffList.map((item: any) => (
        <View
          key={item._id}
          style={[styles.card, { backgroundColor: context.theme.uiBackground }]}
        >
          <View style={styles.cardRow}>
            {item.profilePictureUrl ? (
              <Image
                source={{ uri: item.profilePictureUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: context.primaryColor },
                ]}
              >
                <ThemedText style={styles.avatarInitials}>
                  {(
                    (item.firstName?.[0] ?? "") + (item.lastName?.[0] ?? "")
                  ).toUpperCase() || "?"}
                </ThemedText>
              </View>
            )}
            <View style={styles.cardBody}>
              <ThemedText style={styles.cardTitle}>
                {[item.firstName, item.lastName].filter(Boolean).join(" ") ||
                  "Unnamed"}
              </ThemedText>
              <ThemedText numberOfLines={1}>{item.email}</ThemedText>
              {!!item.phone && (
                <ThemedText numberOfLines={1}>{item.phone}</ThemedText>
              )}
              <View style={styles.badgeRow}>
                <View style={styles.chip}>
                  <ThemedText style={styles.chipText}>{item.role}</ThemedText>
                </View>
              </View>
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
                  previous === `staff-${item._id}` ? null : `staff-${item._id}`,
                )
              }
            >
              <Ionicons
                name="settings-outline"
                size={18}
                color={context.theme.text}
              />
            </Pressable>
            {context.openActionMenu === `staff-${item._id}` ? (
              <View
                style={[
                  styles.iconActionsMenu,
                  { backgroundColor: context.theme.navBackground },
                ]}
              >
                <Pressable
                  style={styles.iconOnlyAction}
                  onPress={() => {
                    context.setViewStaff(item);
                    context.setShowStaffViewModal(true);
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
                    context.openStaffModal(item);
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
                    context.confirmRemoveStaff(item);
                    context.setOpenActionMenu(null);
                  }}
                >
                  <Ionicons
                    name="person-remove-outline"
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
