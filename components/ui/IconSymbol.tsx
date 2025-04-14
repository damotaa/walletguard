// IconSymbol.tsx

import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { StyleProp, TextStyle } from "react-native";

export type IconSymbolName = React.ComponentProps<typeof Feather>["name"];

/**
 * Cross-platform icon component using Feather icons.
 * Feather provides a clean, minimal icon set that works consistently across iOS, Android, and web.
 *
 * Icon `name`s should match Feather icon names: https://feathericons.com
 */
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
