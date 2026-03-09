import React, { memo } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";
import { Theme } from "../theme/Theme";

const ReusableButton = ({
  title,
  onPress,
  style,
  textStyle,
  disabled,
  loading,
  loadingText,
}) => {
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

export default memo(ReusableButton);

const styles = StyleSheet.create({
  button: {
    width: "100%",
    backgroundColor: Theme.colors.primary,
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