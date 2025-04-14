import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import TopBar from "@/components/ui/topBar"; // Import the TopBar component
import Expenses from "@/components/ui/lastExpenses"; // Import the Expenses component
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker from Expo
import { supabase } from "@/db/supabase"; //Establish connection to Supabase
import * as FileSystem from "expo-file-system";

// Define the type for an expense
type Expense = {
  id: number;
  image: string;
  value: number;
  name: string;
  date: string;
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);

  //  State to display extracted info

  const [extractedStore, setExtractedStore] = useState<string | null>(null);
  const [extractedTotal, setExtractedTotal] = useState<number | null>(null);
  const [extractedDate, setExtractedDate] = useState<string | null>(null);

  //  Function to handle image selection from the gallery
  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      setImageUri(selectedImageUri);
      recognizeTextFromImage(selectedImageUri);
    }
  };
  //  Function to handle image selection from the camera
  const recognizeTextFromImage = async (uri: string) => {
    try {
      setLoadingProgress(0);

      let base64Image: string;

      if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () =>
            resolve(reader.result?.toString().split(",")[1] || "");
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        base64Image = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }
      // OpenAI API call, selecting the model and reading the API from the environment .ENV Instructions set to extract store name, total amount, and date.
      const openaiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-2024-08-06",
            messages: [
              {
                role: "system",
                content:
                  "You are a receipt reader. Extract the store name, total amount spent, and date clearly. Use the format:\nStore: [name]\nTotal: £[amount]\nDate: [date]",
              },
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/png;base64,${base64Image}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 300,
          }),
        }
      );

      const result = await openaiResponse.json();
      const reply = result.choices?.[0]?.message?.content || "";
      console.log("OpenAI Receipt Info:", reply);

      const cleanReply = reply.replace(/\*\*/g, "").trim();

      const storeName =
        cleanReply
          .match(/Store\s*:?\s*(.+?)(?=\n|Total|Date|$)/i)?.[1]
          ?.trim() || "Unknown Store";

      const amountMatch = cleanReply.match(/Total\s*:?\s*[£$]?(\d+\.?\d*)/i);
      const totalAmount = amountMatch ? parseFloat(amountMatch[1]) : 0;

      const dateMatch = cleanReply.match(/Date\s*:?\s*([^\n]+)/i);
      const rawDate = dateMatch
        ? dateMatch[1].trim()
        : new Date().toISOString();
      const formattedDate = parseFlexibleDate(rawDate).toISOString();

      //  Update extracted states for UI
      setExtractedStore(storeName);
      setExtractedTotal(totalAmount);
      setExtractedDate(formattedDate);

      console.log("Extracted Data:", {
        store: storeName,
        amount: totalAmount,
        date: formattedDate,
      });

      await addExpense(storeName, formattedDate, totalAmount);
      setLoadingProgress(null);
    } catch (error) {
      console.error("Error recognizing text via OpenAI:", error);
      setLoadingProgress(null);
    }
  };
  // Function to parse flexible date formats, based on data formart the code ajusts the output to UK format DD//MM/YYYY
  const parseFlexibleDate = (dateStr: string): Date => {
    const directParsed = new Date(dateStr);
    if (!isNaN(directParsed.getTime())) {
      return directParsed;
    }

    const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
    const match = dateStr.match(dateRegex);

    if (match) {
      const [_, first, second, year] = match;
      const fullYear = year.length === 2 ? `20${year}` : year;
      const dateAttempts = [
        new Date(`${fullYear}-${second}-${first}`),
        new Date(`${fullYear}-${first}-${second}`),
      ];
      for (const date of dateAttempts) {
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return new Date();
  };
  // Function to capture an image using the camera
  // and request permissions
  //It crops the image to a 3:4 aspect ratio, which is optimal for receipts.
  // The quality is set to 1 for the best image quality.
  // The function also checks for camera and media library permissions.
  // If permissions are not granted, an alert is shown.
  // If the user selects an image, it sets the image URI and calls the text recognition function.
  // The function also handles the case where the user cancels the image selection.
  const captureImageWithCamera = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (
      cameraPermission.status !== "granted" ||
      mediaLibraryPermission.status !== "granted"
    ) {
      alert("Camera and media library permissions are required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // enables cropping
      aspect: [3, 4], // optimal for receipts
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      setImageUri(selectedImageUri);
      recognizeTextFromImage(selectedImageUri);
    }
  };
  // Function to add the expense to the database
  // and update the local state
  // It creates a new expense object with the extracted data and inserts it into the Supabase database.
  // If the insertion is successful, it updates the local state with the new expense.
  const addExpense = async (
    storeName: string,
    date: string,
    totalAmount: number
  ) => {
    const newExpense: Expense = {
      id: Date.now(),
      image: imageUri || "",
      value: totalAmount,
      name: storeName,
      date: date,
    };

    const { error } = await supabase.from("expenses").insert([newExpense]);

    if (error) {
      console.error("Error saving expense: ", error);
    } else {
      setExpenses((prev) => [newExpense, ...prev]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TopBar />
        <View style={styles.blockLarge}>
          <Text style={styles.sectionTitle}>Scan Receipt</Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={pickImageFromGallery}
          >
            <Text style={styles.scanButtonText}>Select from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.scanButton,
              { backgroundColor: "#3f005a", marginTop: 10 },
            ]}
            onPress={captureImageWithCamera}
          >
            <Text style={styles.scanButtonText}>Take Receipt Photo</Text>
          </TouchableOpacity>

          {/* Render extracted info */}
          {extractedStore && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>🛍️ Store: {extractedStore}</Text>
              <Text style={styles.resultText}>
                💷 Total: £{extractedTotal?.toFixed(2)}
              </Text>
              <Text style={styles.resultText}>🗓️ Date: {extractedDate}</Text>
            </View>
          )}
        </View>

        {loadingProgress !== null && (
          <View style={styles.loadingContainer}>
            <Text style={styles.progressText}>
              Processing: {loadingProgress}%
            </Text>
          </View>
        )}

        <View style={styles.blockLarge}>
          <Expenses expenses={expenses} setExpenses={setExpenses} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#6c38fc" },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
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
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  scanButton: {
    backgroundColor: "#580563",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  // 🆕 Style for result box
  resultBox: {
    marginTop: 20,
    backgroundColor: "#312580",
    padding: 16,
    borderRadius: 10,
    width: "100%",
  },
  resultText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 4,
  },
});
