// import { Stack } from "expo-router";
// import { Colors } from "../constants/Colors";
// import { useColorScheme } from "react-native";
// import { StatusBar } from "expo-status-bar";

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme] ?? Colors.light;

//   return (
//     <>
//       <StatusBar value="auto" />
//       <Stack screenOptions={{ headerShown: false, animation: "none" }} />
//       <Stack.Screen
//         name="profile"
//         options={{
//           presentation: "formSheet",
//           gestureDirection: "vertical",
//           animation: "slide_from_bottom",
//           sheetGrabberVisible: true,
//           sheetInitialDetentIndex: 0,
//           sheetAllowedDetents: [0.5, 1.0],
//         }}
//       />
//       {/* <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />r */}
//       {/* <Stack
//         screenOptions={{
//           headerStyle: { backgroundColor: theme.navBackground },
//           headerTintColor: theme.title,
//         }}
//       >
//         <Stack.Screen name="(auth)" options={{ headerShown: false }} />
//         <Stack.Screen name="index" options={{ title: "Home" }} />
//       </Stack> */}
//     </>
//   );
// }
import { Stack } from "expo-router";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(dashboar)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ title: "Home" }} />

        <Stack.Screen
          name="appointListBottomSheet"
          options={{
            presentation: "formSheet",
            gestureDirection: "vertical",
            animation: "slide_from_bottom",
            headerShown: false,
            sheetAllowedDetents: [0.5, 0.85],
            sheetInitialDetentIndex: 0,
            sheetGrabberVisible: true,
          }}
        />
      </Stack>
    </>
  );
}
