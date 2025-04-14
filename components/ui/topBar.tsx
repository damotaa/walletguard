import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { IconButton } from "react-native-paper";

export default function TopBar() {
  //function to pick an image from the media library
  const [image, setImage] = useState<string | null>(null);
  // Request permission to access the media library
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Access to media library is needed to update your profile picture."
        );
      }
    })();
  }, []);
  // function to pick an image from the media library
  // This function uses Expo's ImagePicker to allow the user to select an image from their device.
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Could not pick the image.");
    }
  };

  return (
    <View style={styles.header}>
      {/* Profile Picture */}
      <Pressable onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.initials}>U</Text>
          </View>
        )}
      </Pressable>

      {/* Username or greeting */}
      <Text style={styles.username}>Welcome Back DaMota!</Text>

      {/* Settings Button */}
      <IconButton
        icon="cog"
        size={28}
        iconColor="#fff"
        onPress={() => Alert.alert("Settings", "Settings tapped!")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#211E63",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
    marginTop: 40,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#888",
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  username: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
