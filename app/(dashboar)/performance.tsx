import React from "react";
import { StyleSheet, View } from "react-native";
import ThemedView from "../../components/ThemendView";
import ThemedText from "../../components/ThemedText";

export default function PerformanceScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText title={true} style={styles.title}>
          Performance Overview
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Тук ще показваме KPI статистики за бизнеса.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12 },
  content: { paddingTop: 8 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { marginTop: 8, opacity: 0.8 },
});
