import React, { useEffect, useState } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";

const BarRace = ({
  totalBudget,
  spent,
}: {
  totalBudget: number;
  spent: number;
}) => {
  const available = totalBudget - spent;

  const [availableWidth] = useState(new Animated.Value(0));
  const [spentWidth] = useState(new Animated.Value(0));

  const maxWidth = 300;

  useEffect(() => {
    Animated.timing(availableWidth, {
      toValue: (available / totalBudget) * maxWidth,
      duration: 800,
      useNativeDriver: false,
    }).start();

    Animated.timing(spentWidth, {
      toValue: (spent / totalBudget) * maxWidth,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [available, spent]);

  return (
    <View style={styles.container}>
      {/* Available Bar */}
      <Text style={styles.label}>🏦 Available - £{available.toFixed(2)}</Text>
      <View style={styles.barBackground}>
        <Animated.View
          style={[
            styles.bar,
            { backgroundColor: "#4CAF50", width: availableWidth },
          ]}
        />
      </View>

      {/* Spent Bar */}
      <Text style={styles.label}>📉 Expenses - £{spent.toFixed(2)}</Text>
      <View style={styles.barBackground}>
        <Animated.View
          style={[
            styles.bar,
            { backgroundColor: "#FF5252", width: spentWidth },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "flex-start",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#FFF",
  },
  barBackground: {
    width: 300,
    height: 25,
    backgroundColor: "#FFF",
    borderRadius: 8,
    overflow: "hidden",
  },
  bar: {
    height: 25,
    borderRadius: 8,
  },
});

export default BarRace;
