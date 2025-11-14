import { Stack, Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import CustomHeader from "../../components/CustomHeader";

interface ThemeColors {
  navBackground: string;
  iconColor: string;
  iconColorFocused: string;
}

export default function DashboardLayout(): React.ReactElement {
  const colorScheme = useColorScheme();

  const theme: ThemeColors = (Colors[colorScheme as keyof typeof Colors] ??
    Colors.light) as ThemeColors;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.navBackground,
          paddingTop: 10,
          height: 90,
        },
        tabBarActiveTintColor: theme.iconColorFocused,
        tabBarInactiveTintColor: theme.iconColor,
        // header: () => <CustomHeader userName={"Daniel"} />,
        headerTransparent: true,
        headerShadowVisible: false,
      }}
    >
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
        name="dashboard"
        options={{
          title: "Calendar",
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
    </Tabs>
  );
}
