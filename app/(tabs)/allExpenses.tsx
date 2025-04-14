import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Pressable,
} from "react-native";
import { Avatar, IconButton } from "react-native-paper";
import { supabase } from "@/db/supabase";
import ZoomableImageModal from "@/components/zoomableImageModal";

type Expense = {
  id: number;
  image: string;
  value: number;
  name: string;
  date: string;
};

type Subscription = {
  id: number;
  name: string;
  value: number;
  image: string;
  day: number;
  active: boolean;
};

export default function AllExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [zoomImageVisible, setZoomImageVisible] = useState(false);
  const [zoomImageUri, setZoomImageUri] = useState("");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [newSub, setNewSub] = useState({
    name: "",
    value: "",
    image: "",
    day: "",
  });
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [editSubModalVisible, setEditSubModalVisible] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchSubscriptions();
  }, []);

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      Alert.alert("Error fetching expenses", error.message);
    } else {
      setExpenses(data as Expense[]);
    }
  };

  const fetchSubscriptions = async () => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("active", true);

    if (error) {
      Alert.alert("Error loading subscriptions", error.message);
    } else {
      setSubscriptions(data as Subscription[]);
      autoInsertRecurringExpenses(data as Subscription[]);
    }
  };

  const autoInsertRecurringExpenses = async (subs: Subscription[]) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    for (const sub of subs) {
      if (sub.day === currentDay) {
        const { data: existing } = await supabase
          .from("expenses")
          .select("*")
          .eq("name", sub.name)
          .like(
            "date",
            `${currentYear}-${String(currentMonth).padStart(2, "0")}%`
          );

        if (!existing || existing.length === 0) {
          await supabase.from("expenses").insert({
            name: sub.name,
            value: sub.value,
            image: sub.image,
            date: today.toISOString().split("T")[0],
          });
          fetchExpenses();
        }
      }
    }
  };

  const deleteExpense = async (id: number) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      Alert.alert("Error deleting expense", error.message);
    } else {
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    }
  };

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
      fetchExpenses();
    }
  };

  const createSubscription = async () => {
    const { error } = await supabase.from("subscriptions").insert({
      name: newSub.name,
      value: parseFloat(newSub.value),
      image: newSub.image,
      day: parseInt(newSub.day),
      active: true,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setNewSub({ name: "", value: "", image: "", day: "" });
      setSubModalVisible(false);
      fetchSubscriptions();
    }
  };

  const cancelSubscription = async (id: number) => {
    const { error } = await supabase
      .from("subscriptions")
      .update({ active: false })
      .eq("id", id);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      fetchSubscriptions();
    }
  };

  const updateSubscription = async () => {
    if (!editingSub) return;

    const { error } = await supabase
      .from("subscriptions")
      .update({
        name: editingSub.name,
        value: editingSub.value,
        day: editingSub.day,
        image: editingSub.image,
      })
      .eq("id", editingSub.id);

    if (error) {
      Alert.alert("Error updating subscription", error.message);
    } else {
      setEditSubModalVisible(false);
      fetchSubscriptions();
    }
  };

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Subscriptions</Text>
      <IconButton
        icon="plus"
        iconColor="#00FFAA"
        onPress={() => setSubModalVisible(true)}
        style={{ alignSelf: "center" }}
      />
      {subscriptions.map((sub) => (
        <View key={sub.id} style={styles.expenseItem}>
          <Avatar.Image size={40} source={{ uri: sub.image }} />
          <View style={styles.expenseDetails}>
            <Text style={styles.expenseText}>
              <Text style={styles.label}>Service:</Text> {sub.name}
            </Text>
            <Text style={styles.expenseText}>
              <Text style={styles.label}>Day:</Text> {sub.day}
            </Text>
            <Text style={styles.expenseText}>
              <Text style={styles.label}>Amount:</Text> £{sub.value}
            </Text>
          </View>
          <IconButton
            icon="pencil"
            size={20}
            iconColor="#FFD700"
            onPress={() => {
              setEditingSub(sub);
              setEditSubModalVisible(true);
            }}
          />
          <IconButton
            icon="cancel"
            iconColor="#FF4444"
            onPress={() => cancelSubscription(sub.id)}
          />
        </View>
      ))}

      <Text style={styles.sectionTitle}>All Expenses</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by store name or date"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {filteredExpenses.length === 0 ? (
        <Text style={{ color: "#fff", textAlign: "center" }}>
          No expenses found.
        </Text>
      ) : (
        filteredExpenses.map((expense) => (
          <View key={expense.id} style={styles.expenseItem}>
            <Pressable
              onPress={() => {
                setZoomImageUri(
                  expense.image ||
                    "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
                );
                setZoomImageVisible(true);
              }}
            >
              <Avatar.Image
                size={50}
                source={{
                  uri:
                    expense.image ||
                    "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg",
                }}
              />
            </Pressable>
            <View style={styles.expenseDetails}>
              <Text style={styles.expenseText}>
                <Text style={styles.label}>Store:</Text> {expense.name}
              </Text>
              <Text style={styles.expenseText}>
                <Text style={styles.label}>Date:</Text> {expense.date}
              </Text>
              <Text style={styles.expenseText}>
                <Text style={styles.label}>Amount:</Text> £{expense.value}
              </Text>
            </View>
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
                Alert.alert("Delete Expense", "Are you sure?", [
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
        ))
      )}

      {/* Edit Expense Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
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
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
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

      {/* Add Subscription Modal */}
      <Modal visible={subModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Subscription</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newSub.name}
              onChangeText={(t) => setNewSub((p) => ({ ...p, name: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={newSub.value}
              onChangeText={(t) => setNewSub((p) => ({ ...p, value: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Image URL"
              value={newSub.image}
              onChangeText={(t) => setNewSub((p) => ({ ...p, image: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Day of month (1-31)"
              keyboardType="numeric"
              value={newSub.day}
              onChangeText={(t) => setNewSub((p) => ({ ...p, day: t }))}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <Pressable onPress={() => setSubModalVisible(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </Pressable>
              <Pressable onPress={createSubscription}>
                <Text style={styles.saveButton}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Subscription Modal */}
      <Modal visible={editSubModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Subscription</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editingSub?.name}
              onChangeText={(text) =>
                setEditingSub((prev) => (prev ? { ...prev, name: text } : prev))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={editingSub?.value.toString()}
              onChangeText={(text) =>
                setEditingSub((prev) =>
                  prev ? { ...prev, value: parseFloat(text) } : prev
                )
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Image URL"
              value={editingSub?.image}
              onChangeText={(text) =>
                setEditingSub((prev) =>
                  prev ? { ...prev, image: text } : prev
                )
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Day of month (1-31)"
              keyboardType="numeric"
              value={editingSub?.day.toString()}
              onChangeText={(text) =>
                setEditingSub((prev) =>
                  prev ? { ...prev, day: parseInt(text) } : prev
                )
              }
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <Pressable onPress={() => setEditSubModalVisible(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </Pressable>
              <Pressable onPress={updateSubscription}>
                <Text style={styles.saveButton}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Zoomable Image Modal */}
      <ZoomableImageModal
        visible={zoomImageVisible}
        imageUri={zoomImageUri}
        onClose={() => setZoomImageVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#211E63",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  searchBar: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E2B5F",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  expenseDetails: { marginLeft: 10, flex: 1 },
  expenseText: { fontSize: 16, color: "#FFFFFF", marginBottom: 5 },
  label: { fontWeight: "bold", color: "#FFD700" },
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
