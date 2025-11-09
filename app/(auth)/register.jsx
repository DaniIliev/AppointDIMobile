import { StyleSheet, Text, View } from "react-native";
import React from "react";
import ThemendView from "../../components/ThemendView";
import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import { Link } from "expo-router";

export default function Register() {
  return (
    <ThemendView style={styles.container}>
      <Spacer />

      <ThemedText title={true} style={styles.title}>
        Register For an Account
      </ThemedText>
      <Spacer height={100} />
      <Link href={"/login"}>
        <ThemedText style={{ textAlight: "center" }}>Login instead</ThemedText>
      </Link>
    </ThemendView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 30,
  },
});
