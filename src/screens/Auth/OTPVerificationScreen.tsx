import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { verifyOTP, createUserProfile, getUserProfile } from "../../services/auth.service";
import { useAuthStore } from "../../store/authStore";

interface OTPVerificationScreenProps {
  verificationId: string;
  phoneNumber: string;
  onVerificationSuccess: () => void;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  verificationId,
  phoneNumber,
  onVerificationSuccess,
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser, setUserProfile } = useAuthStore();

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const user = await verifyOTP(verificationId, code);
      setUser(user);

      // Check if user profile exists, if not create one
      let profile = await getUserProfile(user.uid);
      if (!profile) {
        profile = await createUserProfile(user, phoneNumber);
      }
      setUserProfile(profile);

      onVerificationSuccess();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {phoneNumber}
      </Text>

      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="Enter OTP"
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#d32f2f",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 8,
  },
  button: {
    backgroundColor: "#d32f2f",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OTPVerificationScreen;

