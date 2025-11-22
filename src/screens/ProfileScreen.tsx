import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import { useDonorStore } from "../store/donorStore";
import { signOut } from "../services/auth.service";
import { getDonorByUserId, updateDonorProfile } from "../services/donor.service";
import { Donor } from "../types";

const ProfileScreen = ({ navigation }: any) => {
  const { user, userProfile, logout } = useAuthStore();
  const { currentDonor, setCurrentDonor } = useDonorStore();
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentDonor) {
      setIsAvailable(currentDonor.isAvailable);
    } else if (user) {
      loadDonor();
    }
  }, [user, currentDonor]);

  const loadDonor = async () => {
    if (!user) return;
    try {
      const donor = await getDonorByUserId(user.uid);
      if (donor) {
        setCurrentDonor(donor);
        setIsAvailable(donor.isAvailable);
      }
    } catch (error) {
      console.error("Load donor error:", error);
    }
  };

  const handleToggleAvailability = async (value: boolean) => {
    if (!currentDonor) return;

    setLoading(true);
    try {
      await updateDonorProfile(currentDonor.id, { isAvailable: value });
      setCurrentDonor({ ...currentDonor, isAvailable: value });
      setIsAvailable(value);
      Alert.alert("Success", `You are now ${value ? "available" : "unavailable"} for donations`);
    } catch (error) {
      console.error("Update availability error:", error);
      Alert.alert("Error", "Failed to update availability");
      setIsAvailable(!value);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            await logout();
            // Navigation will be handled by App.tsx auth state
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  const age = currentDonor?.dateOfBirth
    ? new Date().getFullYear() - new Date(currentDonor.dateOfBirth).getFullYear()
    : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {userProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{userProfile.phoneNumber}</Text>
          </View>
          {userProfile.displayName && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Display Name</Text>
              <Text style={styles.infoValue}>{userProfile.displayName}</Text>
            </View>
          )}
          {userProfile.email && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userProfile.email}</Text>
            </View>
          )}
        </View>
      )}

      {currentDonor ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Donor Information</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{currentDonor.name}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Blood Group</Text>
              <Text style={[styles.infoValue, styles.bloodGroup]}>
                {currentDonor.bloodGroup}
              </Text>
            </View>
            {age && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{age} years</Text>
              </View>
            )}
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>
                {currentDonor.gender.charAt(0).toUpperCase() +
                  currentDonor.gender.slice(1)}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>
                {currentDonor.address}, {currentDonor.city}, {currentDonor.state}{" "}
                - {currentDonor.pincode}
              </Text>
            </View>
            {currentDonor.lastDonationDate && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Last Donation</Text>
                <Text style={styles.infoValue}>
                  {new Date(currentDonor.lastDonationDate).toLocaleDateString()}
                </Text>
              </View>
            )}
            {currentDonor.emergencyContact && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Emergency Contact</Text>
                <Text style={styles.infoValue}>
                  {currentDonor.emergencyContact.name} -{" "}
                  {currentDonor.emergencyContact.phone}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.switchCard}>
              <View>
                <Text style={styles.switchLabel}>Available for Donation</Text>
                <Text style={styles.switchSubtext}>
                  Toggle to update your availability status
                </Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={handleToggleAvailability}
                disabled={loading}
                trackColor={{ false: "#ccc", true: "#c8e6c9" }}
                thumbColor={isAvailable ? "#4caf50" : "#f44336"}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              // TODO: Implement edit profile screen
              Alert.alert("Coming Soon", "Edit profile feature will be available soon");
            }}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.section}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Not registered as a donor</Text>
            <Text style={styles.emptySubtext}>
              Register as a donor to help save lives
            </Text>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate("DonorRegistration")}
            >
              <Text style={styles.registerButtonText}>Register as Donor</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
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
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  bloodGroup: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  switchCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  switchSubtext: {
    fontSize: 12,
    color: "#999",
  },
  emptyCard: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  registerButton: {
    backgroundColor: "#d32f2f",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "#d32f2f",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    margin: 15,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    margin: 15,
    borderWidth: 1,
    borderColor: "#d32f2f",
  },
  logoutButtonText: {
    color: "#d32f2f",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;

