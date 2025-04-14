import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { IconButton } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select"; //dropdown to select month and year
import TopBar from "@/components/ui/topBar";
import ExpenseGraph from "@/components/monthGraph";
import { supabase } from "@/db/supabase";

const screenWidth = Dimensions.get("window").width;

export default function ResumeGraph() {
  const navigation = useNavigation();
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyData, setMonthlyData] = useState<Record<string, number>>({});
  const [availableMonths, setAvailableMonths] = useState<
    { label: string; value: string }[]
  >([]);
  const [availableYears, setAvailableYears] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch expenses from Supabase and calculate monthly totals.
  // This function fetches the expenses from the database, calculates the monthly totals,
  // and updates the state variables accordingly.
  // It also handles errors and sets the available months and years for the picker.
  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from("expenses")
      .select("value, date")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching expenses:", error.message);
      return;
    }

    if (data) {
      const monthlyTotals: Record<string, number> = {};
      let total = 0;
      const yearsSet = new Set<string>();

      data.forEach((expense) => {
        if (expense.value && expense.date) {
          const date = new Date(expense.date);
          const monthYear = date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          const year = date.getFullYear().toString();

          monthlyTotals[monthYear] =
            (monthlyTotals[monthYear] || 0) + expense.value;
          total += expense.value;
          yearsSet.add(year);
        }
      });

      const months = Object.keys(monthlyTotals)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map((monthYear) => ({ label: monthYear, value: monthYear }));

      const years = Array.from(yearsSet)
        .sort()
        .map((year) => ({ label: year, value: year }));

      setAvailableMonths([
        { label: "All Months", value: "All Months" },
        ...months,
      ]);
      setAvailableYears([{ label: "All Years", value: "All Years" }, ...years]);
      setMonthlyData(monthlyTotals);
      setTotalExpenses(total);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExpenses().finally(() => setRefreshing(false));
  }, []);

  // Filter available month options based on selected year.
  const monthOptions = useMemo(() => {
    if (selectedYear === "All Years") {
      return availableMonths;
    } else {
      return availableMonths.filter((month) =>
        month.value.endsWith(selectedYear)
      );
    }
  }, [availableMonths, selectedYear]);

  // Ensure selectedMonth is valid when the selectedYear changes.
  useEffect(() => {
    if (
      selectedMonth !== "All Months" &&
      !monthOptions.some((option) => option.value === selectedMonth)
    ) {
      setSelectedMonth("All Months");
    }
  }, [selectedYear, monthOptions, selectedMonth]);

  // Compute filtered data for the graph and total expense display.
  const filteredData = useMemo(() => {
    let data: Record<string, number> = {};
    Object.entries(monthlyData).forEach(([key, value]) => {
      const parts = key.split(" ");
      const year = parts[1];
      if (selectedYear !== "All Years" && year !== selectedYear) {
        return;
      }
      data[key] = value;
    });
    if (selectedMonth !== "All Months") {
      data = { [selectedMonth]: data[selectedMonth] || 0 };
    }
    return data;
  }, [monthlyData, selectedMonth, selectedYear]);

  const filteredTotal = useMemo(() => {
    return Object.values(filteredData).reduce((acc, val) => acc + val, 0);
  }, [filteredData]);

  const graphWidth = screenWidth * 0.8;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <TopBar />
        <View style={styles.blockLarge}>
          <Text style={styles.sectionTitle}>Resume</Text>

          <View style={styles.pickerRow}>
            <RNPickerSelect
              onValueChange={(value) => setSelectedMonth(value)}
              items={monthOptions}
              style={pickerSelectStyles}
              placeholder={{}}
              value={selectedMonth}
            />

            <RNPickerSelect
              onValueChange={(value) => setSelectedYear(value)}
              items={availableYears}
              style={pickerSelectStyles}
              placeholder={{}}
              value={selectedYear}
            />
          </View>

          <View style={{ alignItems: "center", width: "100%", marginTop: 20 }}>
            <ExpenseGraph
              width={graphWidth}
              data={filteredData}
              selectedMonth={selectedMonth}
            />
          </View>

          <Text style={styles.expenseText}>
            Total Expenses: £{filteredTotal.toFixed(0)}
          </Text>
        </View>
      </ScrollView>

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
    flex: 1,
    backgroundColor: "#6c38fc",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
    marginTop: 20,
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
  },
  blockLarge: {
    backgroundColor: "#211E63",
    width: "100%",
    borderRadius: 20,
    padding: 15,
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
  expenseText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
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
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignItems: "center",
    marginBottom: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#333333",
    marginVertical: 8,
    width: 160,
    textAlign: "left",
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 10,
    borderColor: "blue",
    borderRadius: 50,
    color: "white",
    paddingRight: 30,
    backgroundColor: "#3356a3",
    marginVertical: 8,
    width: 140,
    height: 60,
    textAlign: "left",
  },
});
