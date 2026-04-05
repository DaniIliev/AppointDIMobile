import {
  StyleSheet,
  View,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import ThemendView from "../../components/ThemendView";
import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import { Link } from "expo-router";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedButton from "../../components/ThemedButton";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Липсват данни", "Попълни всички задължителни полета.");
      return;
    }

    try {
      setLoading(true);
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role: "business",
      });
    } catch (error) {
      Alert.alert(
        "Неуспешна регистрация",
        error instanceof Error
          ? error.message
          : "Възникна грешка при регистрация.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemendView style={styles.container}>
        <Spacer height={30} />

        <ThemedText title={true} style={styles.title}>
          Create Business Account
        </ThemedText>

        <Spacer height={20} />
        <ThemedTextInput
          placeholder="First name"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
        <ThemedTextInput
          placeholder="Last name"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
        <ThemedTextInput
          placeholder="Email"
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
          style={styles.input}
        />
        <ThemedTextInput
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
        />
        <ThemedTextInput
          placeholder="Password"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
          style={styles.input}
        />

        <ThemedButton
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.registerButtonText}>Register</ThemedText>
          )}
        </ThemedButton>

        <Spacer height={16} />
        <Link href={"/login"}>
          <ThemedText style={styles.loginInstead}>Login instead</ThemedText>
        </Link>
      </ThemendView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  input: {
    marginBottom: 12,
  },
  registerButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  registerButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  loginInstead: {
    textAlign: "center",
    color: Colors.primary,
    fontWeight: "600",
  },
});
