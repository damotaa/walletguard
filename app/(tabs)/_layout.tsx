import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // Active tint color
        tabBarActiveTintColor: Colors[colorScheme ?? "dark"].tint,
        // Hides the native header on each screen
        headerShown: false,
        // Custom tab button for haptic feedback
        tabBarButton: HapticTab,
        // Optional custom background
        tabBarBackground: TabBarBackground,
        // Example style overrides
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />

      {/* Camera/Scan Screen */}
      <Tabs.Screen
        name="scanme"
        options={{
          title: "Scan Me",
          tabBarIcon: ({ color }) => (
            <Feather name="camera" size={24} color={color} />
          ),
        }}
      />

      {/* Profile Screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />

      {/* Expenses Screen */}
      <Tabs.Screen
        name="allExpenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color }) => (
            <Feather name="file-text" size={24} color={color} />
          ),
        }}
      />

      {/* Graph/Resume Screen */}
      <Tabs.Screen
        name="resumeGraph"
        options={{
          title: "Graph",
          tabBarIcon: ({ color }) => (
            <Feather name="bar-chart-2" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
