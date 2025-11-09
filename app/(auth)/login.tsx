import {
  StyleSheet,
  View,
  Pressable,
  ImageStyle,
  TextStyle,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import ThemedView from "../../components/ThemendView";
import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import { Link } from "expo-router";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedLogo from "../../components/ThemedLogo";
import ThemedButton from "../../components/ThemedButton";

export default function Login() {
  const handleLogin = () => {
    console.log("Login button pressed");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.fullScreenContainer}>
        <View style={styles.contentContainer}>
          <ThemedLogo style={styles.logo} />
          <ThemedText title={true} style={styles.welcomeText}>
            Welcome Back!
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Please enter your details
          </ThemedText>

          <View style={styles.formCard}>
            <ThemedText style={styles.inputLabel}>Email</ThemedText>
            <ThemedTextInput
              placeholder="your@email.com"
              placeholderTextColor="gray"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <Spacer height={20} />

            <ThemedText style={styles.inputLabel}>Password</ThemedText>
            <ThemedTextInput
              placeholder="********"
              placeholderTextColor="gray"
              secureTextEntry
              style={styles.input}
            />
            <Spacer height={30} />
            <ThemedButton onPress={handleLogin}>
              <ThemedText>Log In</ThemedText>
            </ThemedButton>
            <Spacer height={15} />

            <Link href={"/forgot-password"} asChild>
              <Pressable>
                <ThemedText style={styles.forgotPassword}>
                  Forgot password?
                </ThemedText>
              </Pressable>
            </Link>
          </View>

          <Spacer height={50} />

          <Link href={"/register"} asChild>
            <Pressable>
              <ThemedText style={styles.registerText}>
                Don't have an account?{" "}
                <ThemedText style={styles.registerLink}>
                  Register here
                </ThemedText>
              </ThemedText>
            </Pressable>
          </Link>
        </View>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    position: "relative",
    zIndex: 1,
  },
  logo: {
    width: 65,
    height: 65,
    resizeMode: "contain",
    marginBottom: 20,
  } as ImageStyle,
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 30,
  },
  formCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
  },
  inputLabel: {
    alignSelf: "flex-start",
    marginBottom: 5,
    fontSize: 14,
    color: "white",
  },
  input: {
    width: "100%",
  } as TextStyle,
  forgotPassword: {
    color: "gray",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  registerText: {
    fontSize: 15,
    color: "white",
  },
  registerLink: {
    color: "#007AFF",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
