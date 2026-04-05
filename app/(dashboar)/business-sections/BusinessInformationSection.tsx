import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "../../../components/ThemedText";
import { styles } from "../business.styles";

type Props = {
  context: any;
};

export function BusinessInformationSection({ context }: Props) {
  return (
    <View>
      <View style={[styles.card, { backgroundColor: context.theme.uiBackground }]}> 
        <ThemedText style={styles.cardTitle}>
          {context.businessName || "Business"}
        </ThemedText>
        <ThemedText>Category: {context.category || "-"}</ThemedText>
        <ThemedText>Phone: {context.phone || "-"}</ThemedText>
        <ThemedText numberOfLines={3}>About: {context.aboutUs || "-"}</ThemedText>
        <View style={styles.inlineActions}>
          <Pressable
            style={[
              styles.menuTriggerBtn,
              { backgroundColor: context.theme.navBackground },
            ]}
            onPress={() =>
              context.setOpenActionMenu((previous: string | null) =>
                previous === "info" ? null : "info",
              )
            }
          >
            <Ionicons name="settings-outline" size={18} color={context.theme.text} />
          </Pressable>
          {context.openActionMenu === "info" ? (
            <View
              style={[
                styles.iconActionsMenu,
                { backgroundColor: context.theme.navBackground },
              ]}
            >
              <Pressable
                style={styles.iconOnlyAction}
                onPress={() => {
                  context.setShowInfoModal(true);
                  context.setOpenActionMenu(null);
                }}
              >
                <Ionicons name="create-outline" size={17} color={context.theme.text} />
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
