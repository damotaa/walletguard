import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { IconButton } from "react-native-paper"; // IconButton for the floating action button
import TopBar from "@/components/ui/topBar";

export default function Profile() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("Username123");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <TopBar />

        {/* User Info Section */}
        <View style={styles.blockLarge}>
          <Text style={styles.sectionTitle}>Your Profile</Text>
          <TextInput
            style={styles.usernameInput}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor="#AAA"
          />
        </View>

        {/* Achievements Section */}
        <View style={styles.blockLarge}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsContainer}>
            {/* Achievement Slots */}
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.achievementSlot,
                  i === 0 && styles.achievementEarned,
                ]}
              >
                {i === 0 ? (
                  <>
                    <Text style={styles.achievementText}>🏅</Text>
                    <Text style={styles.achievementLabel}>Welcome</Text>
                    <Text style={styles.achievementPoints}>15G</Text>
                  </>
                ) : (
                  <Text style={styles.lockedText}>🔒</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fab}>
        <IconButton
          icon="plus"
          onPress={() => navigation.navigate("TargetScreen" as never)}
          iconColor="white"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: "#6c38fc",
  },
  scrollContent: {
    flexGrow: 2,
    paddingBottom: 80,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
  },
  blockLarge: {
    backgroundColor: "#211E63",
    width: "100%",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  usernameInput: {
    backgroundColor: "#2E2A80",
    borderRadius: 10,
    padding: 10,
    color: "#FFF",
    fontSize: 18,
    width: "100%",
    marginTop: 10,
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#580563",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  achievementsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    rowGap: 15,
    marginTop: 10,
  },
  achievementSlot: {
    width: 80,
    height: 80,
    borderRadius: 15,
    backgroundColor: "#3F3C99",
    justifyContent: "center",
    alignItems: "center",
  },
  achievementEarned: {
    backgroundColor: "#5BC0BE",
  },
  achievementText: {
    fontSize: 24,
  },
  achievementLabel: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  achievementPoints: {
    fontSize: 10,
    color: "#FFD700",
  },
  lockedText: {
    fontSize: 20,
    color: "#888",
  },
});
