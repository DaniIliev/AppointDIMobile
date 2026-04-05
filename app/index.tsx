import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function Index() {
  const {
    loading,
    isAuthenticated,
    needsOnboarding,
    session,
    selectedLocationId,
  } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (needsOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if ((session?.locations?.length ?? 0) > 1 && !selectedLocationId) {
    return <Redirect href="/(dashboar)/locations" />;
  }

  return <Redirect href="/(dashboar)/dashboard" />;
}
