import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Button,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { IconButton, ProgressBar } from "react-native-paper";
import BarRace from "@/components/BarRace";
import TopBar from "@/components/ui/topBar";
import Expenses from "@/components/ui/lastExpenses";

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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalBudget, setTotalBudget] = useState(3000);
  const [modalVisible, setModalVisible] = useState(false);
  const [budgetInput, setBudgetInput] = useState(totalBudget.toString());

  // 🔥 Use all expenses for calculations 🔥
  const spent = expenses.reduce((acc, expense) => acc + expense.value, 0);
  const remaining = totalBudget - spent;
  const progress = totalBudget > 0 ? remaining / totalBudget : 0;

  // Open the modal for setting a new budget
  const openBudgetModal = () => {
    setBudgetInput(totalBudget.toString());
    setModalVisible(true);
  };

  // Validate and set the new budget, or alert the user if invalid
  const confirmBudget = () => {
    const budgetValue = parseFloat(budgetInput);
    if (!isNaN(budgetValue)) {
      setTotalBudget(budgetValue);
      setModalVisible(false);
    } else {
      Alert.alert("Invalid input", "Please enter a valid number.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <TopBar />

        {/* Budget Overview (Uses all transactions) */}
        <View style={styles.blockLarge}>
          <Text style={styles.sectionTitle}>Budget Overview</Text>
          <BarRace totalBudget={totalBudget} spent={spent} />
          <View style={styles.setBud}>
            <Button
              title="Set Budget"
              onPress={openBudgetModal}
              color="#e6095a"
            />
          </View>
        </View>

        {/* Progress Bar Block (Uses all transactions) */}
        <View style={styles.blockLarge}>
          <Text style={styles.progressTitle}>Left to Spend</Text>

          <View style={styles.progressBarContainer}>
            <View style={{ width: "100%", paddingHorizontal: 10 }}>
              <ProgressBar
                progress={progress}
                color={progress > 0.3 ? "#4CAF50" : "#FF5252"}
                style={{ height: 12, borderRadius: 6 }}
              />
            </View>
            <Text style={styles.remainingText}>£{remaining.toFixed(2)}</Text>
          </View>
        </View>

        {/* Last 5 Expenses (Only displays last 5 transactions) */}
        <View style={styles.blockLarge}>
          <Expenses expenses={expenses.slice(0, 5)} setExpenses={setExpenses} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fab}>
        <IconButton
          icon="plus"
          onPress={() => navigation.navigate("scanme" as never)}
          iconColor="white"
        />
      </View>

      {/* Budget Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Enter your new budget:</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={budgetInput}
              onChangeText={setBudgetInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#FF5252" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={confirmBudget}
              >
                <Text style={styles.buttonText}>Set Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6c38fc",
  },
  scrollContent: {
    flexGrow: 1,
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
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  progressBarContainer: {
    width: "90%",
    position: "relative",
    alignItems: "center",
    paddingBottom: 30,
  },
  remainingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#580563",
    position: "absolute",
    top: 20,
    backgroundColor: "white",
    padding: 5,
    borderRadius: 5,
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
  setBud: {
    marginTop: 5,
    padding: 5,
    backgroundColor: "#471e6b",
    borderRadius: 8,
  },
  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalInput: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export {};
