import React, { memo } from "react";
import { Text } from "react-native";
import useTheme from "../hooks/useTheme";

function AppText({
  children,
  style,
  weight = "regular",
  ...props
}) {
  const { theme } = useTheme();
  const fontWeight = weight === "bold" ? "bold" : weight === "semibold" ? "600" : "400";

  return (
    <Text
      {...props}
      style={[{ fontWeight, color: theme.colors.text }, style]}
    >
      {children}
    </Text>
  );
}

export default memo(AppText);
