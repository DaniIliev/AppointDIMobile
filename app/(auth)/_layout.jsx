import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Redirect } from "expo-router";
import { useAuth } from "../../hooks/useAuth";

export default function AuthLayout() {
  const { loading, isAuthenticated, needsOnboarding } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    if (needsOnboarding) {
      return <Redirect href="/onboarding" />;
    }
    return <Redirect href="/(dashboar)/dashboard" />;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </>
  );
}
