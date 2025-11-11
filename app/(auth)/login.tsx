import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  useColorScheme,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import ThemedView from "../../components/ThemendView";
import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import { Link } from "expo-router";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedLogo from "../../components/ThemedLogo";
import ThemedButton from "../../components/ThemedButton";
import { Colors } from "../../constants/Colors";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface WaveProps {
  height: number;
  color: string;
}
const Wave: React.FC<WaveProps> = ({ height, color }) => {
  const WAVE_HEIGHT = height;
  const WAVE_AMPLITUDE = WAVE_HEIGHT * 0.15;
  const START_Y = WAVE_HEIGHT * 0.9;

  const WAVE_PATH = () => {
    let path = `M0 0`;
    path += ` L0 ${START_Y}`;

    const xStart = 0;
    const xEnd = screenWidth;
    const cp1x = xStart + screenWidth * 0.3;
    const cp1y = START_Y - WAVE_AMPLITUDE;

    const cp2x = xEnd - screenWidth * 0.3;
    const cp2y = START_Y + WAVE_AMPLITUDE;
    path += ` C${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${xEnd} ${START_Y}`;
    path += ` L${screenWidth} ${WAVE_HEIGHT} L0 ${WAVE_HEIGHT} Z`;

    return path;
  };

  return (
    <View
      style={{
        width: screenWidth,
        height: WAVE_HEIGHT,
        position: "absolute",
        bottom: 0,
      }}
    >
      <Svg
        height={WAVE_HEIGHT}
        width={screenWidth}
        viewBox={`0 0 ${screenWidth} ${WAVE_HEIGHT}`}
        style={styles.svg}
      >
        <Path d={WAVE_PATH()} fill={color} />
      </Svg>
    </View>
  );
};

export default function Login() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"] ?? Colors.light;

  const [isWelcomeScreen, setIsWelcomeScreen] = useState(true);
  const handleLogin = () => {
    console.log("Login button pressed");
    // Implement login logic here
  };

  const handleContinue = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsWelcomeScreen(false);
  };

  const topSectionHeight = isWelcomeScreen
    ? screenHeight * 0.7
    : screenHeight * 0.4;
  const bottomSectionHeight = screenHeight - topSectionHeight;

  const waveHeight = screenHeight * 0.5;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.fullScreenContainer}>
        <View
          style={[
            styles.topSection,
            { height: topSectionHeight, backgroundColor: Colors.primary },
          ]}
        >
          <View style={styles.logoContainer}>
            <ThemedLogo style={styles.logo} />
          </View>
          <Wave height={waveHeight} color={theme.background} />
        </View>
        <View style={[styles.bottomSection, { height: bottomSectionHeight }]}>
          {isWelcomeScreen ? (
            <View style={styles.welcomeContent}>
              <ThemedText title={true} style={styles.welcomeText}>
                Welcome
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Lorem ipsum dolor sit amet consectetur.
              </ThemedText>
              <Pressable onPress={handleContinue} style={styles.continueButton}>
                <ThemedText style={styles.continueText}>Continue →</ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <ThemedText
                title={true}
                style={[styles.welcomeText, styles.signInTitle]}
              >
                Sign in
              </ThemedText>

              <View style={styles.formCard}>
                <ThemedText style={styles.inputLabel}>Email</ThemedText>
                <ThemedTextInput
                  placeholder="demo@email.com"
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

                <View style={styles.forgotPasswordRow}>
                  <ThemedText style={styles.rememberMe}>Remember Me</ThemedText>
                  <Link href={"/forgot-password"} asChild>
                    <Pressable>
                      <ThemedText
                        style={[
                          styles.forgotPassword,
                          { color: Colors.primary },
                        ]}
                      >
                        Forgot Password?
                      </ThemedText>
                    </Pressable>
                  </Link>
                </View>
                <Spacer height={20} />

                <ThemedButton
                  onPress={handleLogin}
                  style={[
                    styles.loginButton,
                    { backgroundColor: Colors.primary },
                  ]}
                >
                  <ThemedText style={styles.loginButtonText}>Login</ThemedText>
                </ThemedButton>
              </View>

              <Spacer height={50} />

              <Link href={"/register"} asChild>
                <Pressable style={styles.registerLinkContainer}>
                  <ThemedText style={styles.registerText}>
                    Don't have an Account?{" "}
                    <ThemedText
                      style={[styles.registerLink, { color: Colors.primary }]}
                    >
                      Sign up
                    </ThemedText>
                  </ThemedText>
                </Pressable>
              </Link>
            </View>
          )}
        </View>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  topSection: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 0,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    tintColor: "white",
  },
  bottomSection: {
    width: "100%",
    // backgroundColor: "white",
  },
  svg: {
    // Позиционирането на SVG-то е вече в стила на View, но може да се добавят допълнителни настройки тук
  },
  welcomeContent: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "flex-end",
    paddingBottom: 50,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  signInTitle: {
    paddingTop: 30,
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    marginTop: 10,
    marginBottom: 50,
  },
  continueButton: {
    alignSelf: "flex-end",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  continueText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
  },
  formCard: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
    paddingBottom: 5,
  },
  forgotPasswordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rememberMe: {
    fontSize: 14,
    color: "gray",
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  registerLinkContainer: {
    alignSelf: "center",
  },
  registerText: {
    textAlign: "center",
    color: "gray",
  },
  registerLink: {
    fontWeight: "bold",
  },
});
