// IconSymbol.tsx
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { StyleProp, TextStyle } from "react-native";

export type IconSymbolName = React.ComponentProps<typeof Feather>["name"];

export function IconSymbol({
  name,
  size = 12,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
}) {
  return <Feather name={name} size={size} color={color} style={style} />;
}
