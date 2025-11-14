import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { Link } from "expo-router";
import ThemedView from "../components/ThemendView";
import ThemedLogo from "../components/ThemedLogo";
import Spacer from "../components/Spacer";
import ThemedText from "../components/ThemedText";

const Index: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedLogo style={styles.logo} />
      <Spacer height={20} />

      <ThemedText style={styles.title} title={true}>
        The Number 1
      </ThemedText>

      <Text>Reading List App</Text>
      <Spacer height={10} />

      <View style={styles.card}>
        <Text>Hello, this is a card</Text>
      </View>

      <Link href={"/login"} style={styles.link}>
        <ThemedText>Login</ThemedText>
      </Link>
      <Link href={"/register"} style={styles.link}>
        <ThemedText>Register</ThemedText>
      </Link>
      <Link href={"/about"} style={styles.link}>
        <ThemedText>About</ThemedText>
      </Link>
      <Link href={"/dashboard"} style={styles.link}>
        <ThemedText>Dashboard</ThemedText>
      </Link>
      <Link href={"/profile"} style={styles.link}>
        <ThemedText>Test</ThemedText>
      </Link>
      <Link href={"/performance"} style={styles.link}>
        <ThemedText>pr</ThemedText>
      </Link>
    </ThemedView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,

  title: {
    fontWeight: "bold",
    fontSize: 18,
  } as TextStyle,

  card: {
    backgroundColor: "#eee",
    padding: 20,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  } as ViewStyle,

  logo: {
    borderRadius: 10,
    marginBottom: 10,
  } as ImageStyle,

  link: {
    marginVertical: 10,
    borderBottomWidth: 1,
  } as TextStyle,
});
