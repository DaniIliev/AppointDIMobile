import { Tabs, Redirect, usePathname } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useAuth } from "../../hooks/useAuth";
import ThemedView from "../../components/ThemendView";
import TopNavigation from "../../components/TopNavigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ThemeColors {
  background: string;
  navBackground: string;
  iconColor: string;
  iconColorFocused: string;
}

export default function DashboardLayout(): React.ReactElement {
  const systemScheme = useColorScheme();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const {
    loading,
    isAuthenticated,
    needsOnboarding,
    session,
    selectedLocationId,
    themePreference,
    primaryColor,
  } = useAuth();

  if (loading) {
    return <></>;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (needsOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (
    (session?.locations?.length ?? 0) > 1 &&
    !selectedLocationId &&
    pathname !== "/(dashboar)/locations"
  ) {
    return <Redirect href="/(dashboar)/locations" />;
  }

  const resolvedScheme = themePreference ?? systemScheme;

  const theme: ThemeColors = (Colors[resolvedScheme as keyof typeof Colors] ??
    Colors.light) as ThemeColors;

  const currentScreen = pathname.split("/").filter(Boolean).pop() ?? "home";
  const titleMap: Record<string, string> = {
    home: "Home",
    dashboard: "Dashboard",
    business: "Business",
    performance: "Performance",
    profile: "Profile",
    locations: "Locations",
    kanban: "Kanban",
  };
  const navigationTitle = titleMap[currentScreen] ?? "AppointDI";

  return (
    <ThemedView style={{ flex: 1 }}>
      <TopNavigation title={navigationTitle} />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: {
            backgroundColor: theme.background,
          },
          tabBarStyle: {
            backgroundColor: theme.navBackground,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 10),
            height: 62 + Math.max(insets.bottom, 10),
          },
          tabBarActiveTintColor: primaryColor,
          tabBarInactiveTintColor: theme.iconColor,
          headerTransparent: true,
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <Ionicons
                size={24}
                name={focused ? "home" : "home-outline"}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="locations"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <Ionicons
                size={24}
                name={focused ? "calendar" : "calendar-outline"}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="business"
          options={{
            title: "Business",
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <Ionicons
                size={24}
                name={focused ? "briefcase" : "briefcase-outline"}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="performance"
          options={{
            title: "Performance",
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <Ionicons
                size={24}
                name={focused ? "stats-chart" : "stats-chart-outline"}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="kanban"
          options={{
            title: "Kanban",
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <Ionicons
                size={24}
                name={focused ? "grid" : "grid-outline"}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
      </Tabs>
    </ThemedView>
  );
}
