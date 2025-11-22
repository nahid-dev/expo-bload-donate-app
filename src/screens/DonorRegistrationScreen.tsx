import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import { useAuthStore } from "../store/authStore";
import { useDonorStore } from "../store/donorStore";
import { createDonorProfile } from "../services/donor.service";
import { BloodGroup } from "../types";

interface DonorFormData {
  name: string;
  bloodGroup: BloodGroup;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

const DonorRegistrationScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { setCurrentDonor, setIsRegistered } = useDonorStore();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DonorFormData>();

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      // Store location for later use
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Failed to get location");
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  const onSubmit = async (data: DonorFormData) => {
    if (!user) {
      Alert.alert("Error", "Please login first");
      return;
    }

    setLoading(true);
    try {
      const location = await getCurrentLocation();

      const donorData = {
        userId: user.uid,
        name: data.name,
        phoneNumber: user.phoneNumber || "",
        bloodGroup: data.bloodGroup,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        location: location || undefined,
        isAvailable: true,
        emergencyContact: {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
        },
      };

      const donor = await createDonorProfile(donorData);
      setCurrentDonor(donor);
      setIsRegistered(true);

      Alert.alert("Success", "Donor profile created successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert("Error", error.message || "Failed to create donor profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Donor Registration</Text>
        <Text style={styles.subtitle}>Help save lives by becoming a donor</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <Controller
            control={control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder="Enter your full name"
              />
            )}
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name.message}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Blood Group *</Text>
          <Controller
            control={control}
            name="bloodGroup"
            rules={{ required: "Blood group is required" }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Blood Group" value="" />
                  <Picker.Item label="A+" value="A+" />
                  <Picker.Item label="A-" value="A-" />
                  <Picker.Item label="B+" value="B+" />
                  <Picker.Item label="B-" value="B-" />
                  <Picker.Item label="AB+" value="AB+" />
                  <Picker.Item label="AB-" value="AB-" />
                  <Picker.Item label="O+" value="O+" />
                  <Picker.Item label="O-" value="O-" />
                </Picker>
              </View>
            )}
          />
          {errors.bloodGroup && (
            <Text style={styles.errorText}>{errors.bloodGroup.message}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth *</Text>
          <Controller
            control={control}
            name="dateOfBirth"
            rules={{ required: "Date of birth is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder="YYYY-MM-DD"
              />
            )}
          />
          {errors.dateOfBirth && (
            <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender *</Text>
          <Controller
            control={control}
            name="gender"
            rules={{ required: "Gender is required" }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            )}
          />
          {errors.gender && (
            <Text style={styles.errorText}>{errors.gender.message}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address *</Text>
          <Controller
            control={control}
            name="address"
            rules={{ required: "Address is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={value}
                onChangeText={onChange}
                placeholder="Enter your address"
                multiline
                numberOfLines={3}
              />
            )}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address.message}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City *</Text>
          <Controller
            control={control}
            name="city"
            rules={{ required: "City is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder="Enter your city"
              />
            )}
          />
          {errors.city && (
            <Text style={styles.errorText}>{errors.city.message}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>State *</Text>
          <Controller
            control={control}
            name="state"
            rules={{ required: "State is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder="Enter your state"
              />
            )}
          />
          {errors.state && (
            <Text style={styles.errorText}>{errors.state.message}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pincode *</Text>
          <Controller
            control={control}
            name="pincode"
            rules={{ required: "Pincode is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder="Enter pincode"
                keyboardType="number-pad"
              />
            )}
          />
          {errors.pincode && (
            <Text style={styles.errorText}>{errors.pincode.message}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Emergency Contact Name *</Text>
          <Controller
            control={control}
            name="emergencyContactName"
            rules={{ required: "Emergency contact name is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder="Enter emergency contact name"
              />
            )}
          />
          {errors.emergencyContactName && (
            <Text style={styles.errorText}>
              {errors.emergencyContactName.message}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Emergency Contact Phone *</Text>
          <Controller
            control={control}
            name="emergencyContactPhone"
            rules={{ required: "Emergency contact phone is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder="Enter emergency contact phone"
                keyboardType="phone-pad"
              />
            )}
          />
          {errors.emergencyContactPhone && (
            <Text style={styles.errorText}>
              {errors.emergencyContactPhone.message}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading || locationLoading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Register as Donor</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#d32f2f",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
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
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: "#d32f2f",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DonorRegistrationScreen;

