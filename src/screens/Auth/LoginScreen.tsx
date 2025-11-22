import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../services/firebase";
import { firebaseConfig } from "../../config/firebase.config";
import OTPVerificationScreen from "./OTPVerificationScreen";
import { useAuthStore } from "../../store/authStore";

const LoginScreen = ({ navigation }: any) => {
  const recaptchaRef = useRef<any>(null);
  const [phone, setPhone] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const sendVerification = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    // Ensure phone number starts with +
    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    setLoading(true);
    try {
      const verification = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaRef.current
      );
      setVerificationId(verification.verificationId);
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (verificationId) {
    return (
      <OTPVerificationScreen
        verificationId={verificationId}
        phoneNumber={phone}
        onVerificationSuccess={() => {
          setVerificationId(null);
          // Navigation will be handled by AppNavigator based on auth state
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification
      />
      <View style={styles.content}>
        <Text style={styles.title}>RaktoConnect</Text>
        <Text style={styles.subtitle}>Blood Donation Network</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+8801XXXXXXXXX"
            keyboardType="phone-pad"
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={sendVerification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          We'll send you a verification code to confirm your phone number
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#d32f2f",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});

export default LoginScreen;
