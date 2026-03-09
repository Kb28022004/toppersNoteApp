import { View, StyleSheet, Image, StatusBar } from "react-native";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Theme } from "../theme/Theme";
import SelectUserCard from "../components/SelectUserCard";
import AppText from "../components/AppText";
import Loader from "../components/Loader";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen() {

  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {

      const token = await AsyncStorage.getItem("token");
      const userStr = await AsyncStorage.getItem("user");

      if (token && userStr) {

        const user = JSON.parse(userStr);

        if (!user.profileCompleted) {

          if (user.role === "TOPPER") {
            navigation.replace("TopperProfileSetup");
          } else if (user.role === "ADMIN") {
            navigation.replace("AdminProfileSetup");
          } else {
            navigation.replace("StudentProfileSetup");
          }
          return;
        }

        if (user.role === "STUDENT") {
          navigation.replace("Home");
          return;
        }

        if (user.role === "ADMIN") {
          navigation.replace("AdminDashboard");
          return;
        }

        if (user.role === "TOPPER") {
          if (user.isTopperVerified) {
            navigation.replace("Home");
          } else {
            navigation.replace("TopperApprovalPending");
          }
          return;
        }
      }

      setIsLoading(false);
    };

    checkAuth();

  }, [navigation]);

  const studentParams = useMemo(() => ({ role: "STUDENT" }), []);
  const topperParams = useMemo(() => ({ role: "TOPPER" }), []);

  return (

    <LinearGradient
      colors={["#020617", "#0F172A", "#020617"]}
      style={styles.container}
    >

      <StatusBar barStyle="light-content" />

      <Loader visible={isLoading} />

      {/* Logo Section */}

      <View style={styles.logoSection}>

        <Image
          source={require("../../assets/topperNotes.avif")}
          style={styles.logo}
        />

        <AppText style={styles.brandName}>
          ToppersNote
        </AppText>

      </View>


      {/* Heading Section */}

      <View style={styles.headingSection}>

        <AppText style={styles.heading}>
          Study Smart.
        </AppText>

        <AppText style={styles.headingHighlight}>
          Share Knowledge.
        </AppText>

        <AppText style={styles.subHeading}>
          Learn from toppers or share your notes and earn.
        </AppText>

      </View>


      {/* User Selection */}

      <View style={styles.cardSection}>

        <SelectUserCard
          imageSource={require("../../assets/student.avif")}
          title="I'm a Student"
          description="Find verified notes & ace your exams"
          routeName="SendOtp"
          params={studentParams}
        />

        <SelectUserCard
          imageSource={require("../../assets/topper.avif")}
          title="I'm a Topper"
          description="Upload notes & earn money"
          routeName="SendOtp"
          params={topperParams}
        />

      </View>


      {/* Footer */}

      <View style={styles.footer}>

        <AppText style={styles.footerText}>
          Trusted by thousands of students
        </AppText>

      </View>

    </LinearGradient>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: Theme.layout.screenPadding,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 30
  },

  logoSection: {
    alignItems: "center",
  },

  logo: {
    width: 65,
    height: 65,
    borderRadius: 16,
    marginBottom: 12
  },

  brandName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1
  },

  headingSection: {
    alignItems: "center",
    marginTop: 20
  },

  heading: {
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
    textAlign: "center"
  },

  headingHighlight: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#3B82F6",
    textAlign: "center"
  },

  subHeading: {
    marginTop: 12,
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 20
  },

  cardSection: {
    gap: 18,
    marginTop: 20
  },

  footer: {
    alignItems: "center",
    marginTop: 10
  },

  footerText: {
    color: "#64748B",
    fontSize: 13
  }

});