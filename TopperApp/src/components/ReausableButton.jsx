import React, { memo, useMemo } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";
import useTheme from "../hooks/useTheme";

const ReusableButton = ({
  title,
  onPress,
  style,
  textStyle,
  disabled,
  loading,
  loadingText,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        (disabled || loading) && { opacity: 0.7 },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      <View style={styles.content}>
        {loading ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <AppText style={[styles.text, textStyle]}>
              {loadingText || title}
            </AppText>
          </>
        ) : (
          <>
            <AppText style={[styles.text, textStyle]}>
              {title}
            </AppText>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme) => StyleSheet.create({
  button: {
    width: "100%",
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default memo(ReusableButton);