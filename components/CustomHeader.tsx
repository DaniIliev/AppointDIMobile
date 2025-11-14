// // (dashboar)/_components/CustomHeader.tsx

// import React from "react";
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   useColorScheme,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors } from "../constants/Colors";
// import ThemedText from "./ThemedText";
// import ThemedView from "./ThemendView";

// interface CustomHeaderProps {
//   userName: string;
// }

// const CustomHeader: React.FC<CustomHeaderProps> = ({ userName }) => {
//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme ?? "light"] ?? Colors.light;

//   // Примерна снимка на потребител (заместете с реална логика)
//   const userImage = "https://i.pravatar.cc/150?img=1";

//   return (
//     <ThemedView
//       style={[styles.container, { backgroundColor: Colors.primary }]}
//       safe={true}
//     >
//       <ThemedView style={{ backgroundColor: Colors.primary }}>
//         <ThemedText style={styles.greetingText}>Hello, Daniel!</ThemedText>
//       </ThemedView>
//       <ThemedView
//         style={[styles.rightIcons, { backgroundColor: Colors.primary }]}
//       >
//         <TouchableOpacity style={styles.iconButton}>
//           <Ionicons
//             name="notifications-outline"
//             size={24}
//             color={theme.iconColor}
//           />
//         </TouchableOpacity>
//         <ThemedView
//           style={[styles.avatarContainer, { borderColor: Colors.primary }]}
//         >
//           <Ionicons
//             name="person-circle-outline"
//             size={30}
//             color={theme.iconColor}
//           />
//         </ThemedView>
//       </ThemedView>
//     </ThemedView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 10,
//     paddingBottom: 10,
//   },
//   greetingText: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   rightIcons: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   iconButton: {
//     padding: 5,
//     marginHorizontal: 5,
//   },
//   avatarContainer: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     marginLeft: 10,
//     overflow: "hidden",
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// export default CustomHeader;
// (dashboar)/_components/CustomHeader.tsx

import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemendView";
import { SafeAreaView } from "react-native-safe-area-context"; // <-- НУЖЕН ИМПОРТ

interface CustomHeaderProps {
  userName: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ userName }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"] ?? Colors.light;

  return (
    // 1. Използваме SafeAreaView за правилно отстояние от горната част на екрана
    // edges={['top']} гарантира, че ще се добави отстояние само отгоре.
    <SafeAreaView style={[{ backgroundColor: Colors.primary }]} edges={["top"]}>
      <ThemedView
        // 2. Външният ThemedView вече НЕ използва safe={true}
        style={[styles.container, { backgroundColor: Colors.primary }]}
      >
        <ThemedView style={{ backgroundColor: Colors.primary }}>
          <ThemedText style={styles.greetingText}>Hello, Daniel!</ThemedText>
        </ThemedView>
        <ThemedView
          style={[styles.rightIcons, { backgroundColor: Colors.primary }]}
        >
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.iconColor}
            />
          </TouchableOpacity>
          <ThemedView
            style={[styles.avatarContainer, { borderColor: Colors.primary }]}
          >
            <Ionicons
              name="person-circle-outline"
              size={30}
              color={theme.iconColor}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    // Тези paddingTop/Bottom вече контролират само вътрешното пространство
    paddingTop: 10,
    paddingBottom: 10,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 5,
    marginHorizontal: 5,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CustomHeader;
