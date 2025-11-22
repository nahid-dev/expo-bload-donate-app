import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuthStore } from "./src/store/authStore";
import { setupAuthListener, getUserProfile, createUserProfile } from "./src/services/auth.service";
import AppNavigator from "./src/navigation/AppNavigator";
import { User as FirebaseUser } from "firebase/auth";

export default function App() {
  const { user, setUser, setUserProfile, setLoading, isLoading } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = setupAuthListener(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Load or create user profile
        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          profile = await createUserProfile(
            firebaseUser,
            firebaseUser.phoneNumber || ""
          );
        }
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }

      if (initializing) {
        setInitializing(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (initializing || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d32f2f" />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
