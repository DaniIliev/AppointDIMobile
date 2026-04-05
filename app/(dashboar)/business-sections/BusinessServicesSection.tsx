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

export function BusinessServicesSection({ context }: Props) {
  return (
    <View>
      <ThemedButton
        style={styles.actionButton}
        onPress={() => context.openServiceModal()}
      >
        <ThemedText style={styles.btnText}>+ Add service</ThemedText>
      </ThemedButton>
      {context.services.map((service: any) => (
        <View
          key={service._id}
          style={[styles.card, { backgroundColor: context.theme.uiBackground }]}
        >
          <View style={styles.cardRow}>
            {service.imageUrl ? (
              <Image
                source={{ uri: service.imageUrl }}
                style={styles.cardThumb}
              />
            ) : (
              <View style={styles.cardThumbPlaceholder}>
                <Ionicons
                  name="construct-outline"
                  size={22}
                  color={context.theme.iconColor}
                />
              </View>
            )}
            <View style={styles.cardBody}>
              <ThemedText style={styles.cardTitle}>{service.name}</ThemedText>
              <ThemedText numberOfLines={1}>
                {service.category} • {service.duration}min • {service.price} лв
              </ThemedText>
              <View style={styles.badgeRow}>
                <View style={styles.chip}>
                  <ThemedText style={styles.chipText}>
                    {service.paymentOption ?? "cash"}
                  </ThemedText>
                </View>
                {service.isGroup && (
                  <View style={[styles.chip, styles.chipGroup]}>
                    <ThemedText style={styles.chipText}>
                      Group ×{service.capacity}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.chip}>
                  <ThemedText style={styles.chipText}>
                    Staff {(service.staffMembers ?? []).length}
                  </ThemedText>
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
                  previous === `service-${service._id}`
                    ? null
                    : `service-${service._id}`,
                )
              }
            >
              <Ionicons
                name="settings-outline"
                size={18}
                color={context.theme.text}
              />
            </Pressable>
            {context.openActionMenu === `service-${service._id}` ? (
              <View
                style={[
                  styles.iconActionsMenu,
                  { backgroundColor: context.theme.navBackground },
                ]}
              >
                <Pressable
                  style={styles.iconOnlyAction}
                  onPress={() => {
                    context.setViewService(service);
                    context.setShowServiceViewModal(true);
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
                    context.openServiceModal(service);
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
                    context.confirmDeleteService(service);
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
