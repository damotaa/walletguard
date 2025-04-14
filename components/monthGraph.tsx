import React, { useState, useEffect } from "react";
import { Animated } from "react-native";
import { BarChart } from "react-native-chart-kit";

type ExpenseGraphProps = {
  width: number;
  selectedMonth: string;
  data: Record<string, number>;
};

const ExpenseGraph = ({ width, selectedMonth, data }: ExpenseGraphProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.spring(fadeAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, []);

  // If "All Months" is selected, show all months as labels; otherwise, show only the selected month.
  const labels =
    selectedMonth === "All Months" ? Object.keys(data) : [selectedMonth];

  // Data points array corresponding to the labels
  const dataPoints = labels.map((month) => data[month] || 0);

  // Structure for the BarChart
  const chartData = {
    labels,
    datasets: [{ data: dataPoints }],
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: "#3356a3",
    backgroundGradientTo: "#192f6a",
    decimalPlaces: 2, // keep or remove decimals here if needed
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    barPercentage: 0.6,
  };

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }] }}
    >
      <BarChart
        data={chartData}
        width={width}
        height={220}
        chartConfig={chartConfig}
        yAxisLabel="£"
        yAxisSuffix=""
        style={{ borderRadius: 16 }}
        fromZero
        showValuesOnTopOfBars
        /* 
          The following props disable the dashed/grid lines:
        */
        withInnerLines={false} // No grid lines inside the chart
        withVerticalLabels={true} // No vertical labels
        withHorizontalLabels={true} // No horizontal labels
      />
    </Animated.View>
  );
};

export default ExpenseGraph;
