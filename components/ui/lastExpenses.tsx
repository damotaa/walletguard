import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Pressable,
  ScrollView, // optional if you want a scroll within the component
} from "react-native";
import { Avatar, IconButton } from "react-native-paper";
import { supabase } from "@/db/supabase";

type Expense = {
  id: number;
  image: string;
  value: number;
  name: string;
  date: string;
};

export default function Expenses({
  expenses,
  setExpenses,
}: {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  //funtion to fetch expenses from the database
  // This function fetches the expenses from the database and updates the state.
  // It uses Supabase to query the "expenses" table and orders the results by ID in descending order.

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      Alert.alert("Error fetching expenses", error.message);
    } else if (data) {
      setExpenses(data as Expense[]);
    }
  };
  //function to delete an expense
  const deleteExpense = async (id: number) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      Alert.alert("Error deleting expense", error.message);
    } else {
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    }
  };

  //function to update an expense

  const updateExpense = async () => {
    if (!editingExpense) return;

    const { error } = await supabase
      .from("expenses")
      .update({
        name: editingExpense.name,
        value: editingExpense.value,
        date: editingExpense.date,
      })
      .eq("id", editingExpense.id);

    if (error) {
      Alert.alert("Error updating expense", error.message);
    } else {
      setEditModalVisible(false);
      fetchExpenses(); // Refresh list
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Last Expenses</Text>

      {/* If you prefer a ScrollView inside, uncomment this: 
      <ScrollView> 
      */}
      {expenses.length === 0 ? (
        <Text style={styles.emptyText}>No expenses yet.</Text>
      ) : (
        // Show only the first 5 for "Last Expenses"
        expenses.slice(0, 5).map((expense) => (
          <View key={expense.id} style={styles.expenseItem}>
            {/* Avatar Container */}
            <View style={styles.avatarContainer}>
              <Avatar.Image
                size={40}
                source={{
                  uri:
                    expense.image ||
                    "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg",
                }}
              />
            </View>

            {/* Details Container */}
            <View style={styles.expenseDetails}>
              <Text style={styles.expenseText}>
                <Text style={styles.label}>Store:</Text> {expense.name}
              </Text>
              <Text style={styles.expenseText}>
                <Text style={styles.label}>Date:</Text>{" "}
                {new Date(expense.date).toLocaleDateString()}
              </Text>
              <Text style={styles.expenseText}>
                <Text style={styles.label}>Amount:</Text> £{expense.value}
              </Text>
            </View>

            {/* Icons Container */}
            <View style={styles.iconsContainer}>
              <IconButton
                icon="pencil"
                size={20}
                iconColor="#FFD700"
                onPress={() => {
                  setEditingExpense(expense);
                  setEditModalVisible(true);
                }}
              />
              <IconButton
                icon="delete"
                size={20}
                iconColor="#FF6B6B"
                onPress={() =>
                  Alert.alert("Confirm Delete", "Delete this expense?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => deleteExpense(expense.id),
                    },
                  ])
                }
              />
            </View>
          </View>
        ))
      )}
      {/* Uncomment if you use a ScrollView 
      </ScrollView>
      */}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Expense</Text>
            <TextInput
              style={styles.input}
              placeholder="Store"
              value={editingExpense?.name}
              onChangeText={(text) =>
                setEditingExpense((prev) =>
                  prev ? { ...prev, name: text } : prev
                )
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={editingExpense?.value.toString()}
              onChangeText={(text) =>
                setEditingExpense((prev) =>
                  prev ? { ...prev, value: parseFloat(text) } : prev
                )
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={editingExpense?.date}
              onChangeText={(text) =>
                setEditingExpense((prev) =>
                  prev ? { ...prev, date: text } : prev
                )
              }
            />

            <View style={styles.modalButtonsRow}>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </Pressable>
              <Pressable onPress={updateExpense}>
                <Text style={styles.saveButton}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/** --- STYLES --- */
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#211E63",
    padding: 20,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  emptyText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },
  expenseItem: {
    flexDirection: "row", // Items in a row
    alignItems: "center",
    backgroundColor: "#2E2B5F",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  avatarContainer: {
    marginRight: 10,
  },
  expenseDetails: {
    flex: 1, // take up remaining space
    marginRight: 5,
  },
  expenseText: {
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 3,
    flexWrap: "wrap",
  },
  label: {
    fontWeight: "bold",
    color: "#FFD700",
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  /** Modal Styles */
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    color: "#999",
    marginRight: 20,
    fontSize: 16,
  },
  saveButton: {
    color: "#211E63",
    fontWeight: "bold",
    fontSize: 16,
  },
});
