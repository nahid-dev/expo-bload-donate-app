import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import { useDonorStore } from "../store/donorStore";
import { getBloodRequests } from "../services/request.service";
import { getDonorByUserId } from "../services/donor.service";
import { BloodRequest } from "../types";

const HomeScreen = ({ navigation }: any) => {
  const { user, userProfile } = useAuthStore();
  const { currentDonor, setCurrentDonor, setIsRegistered } = useDonorStore();
  const [recentRequests, setRecentRequests] = useState<BloodRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (user) {
        const donor = await getDonorByUserId(user.uid);
        if (donor) {
          setCurrentDonor(donor);
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
        }

        const requests = await getBloodRequests(undefined, "pending");
        setRecentRequests(requests.slice(0, 5));
      }
    } catch (error) {
      console.error("Load data error:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Welcome{userProfile?.displayName ? `, ${userProfile.displayName}` : ""}!
        </Text>
        <Text style={styles.subtitle}>Save Lives, Donate Blood</Text>
      </View>

      {!currentDonor && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Become a Donor</Text>
          <Text style={styles.cardText}>
            Register as a blood donor and help save lives in your community.
          </Text>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate("DonorRegistration")}
          >
            <Text style={styles.cardButtonText}>Register Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentDonor && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Donor Profile</Text>
          <Text style={styles.cardText}>
            Blood Group: <Text style={styles.bold}>{currentDonor.bloodGroup}</Text>
          </Text>
          <Text style={styles.cardText}>
            Status:{" "}
            <Text style={[styles.bold, currentDonor.isAvailable && styles.available]}>
              {currentDonor.isAvailable ? "Available" : "Not Available"}
            </Text>
          </Text>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.cardButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("SearchDonors")}
          >
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionText}>Search Donors</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("BloodRequests")}
          >
            <Text style={styles.actionIcon}>🩸</Text>
            <Text style={styles.actionText}>Blood Requests</Text>
          </TouchableOpacity>
        </View>
      </View>

      {recentRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Blood Requests</Text>
          {recentRequests.map((request) => (
            <TouchableOpacity
              key={request.id}
              style={styles.requestCard}
              onPress={() => navigation.navigate("BloodRequests")}
            >
              <View style={styles.requestHeader}>
                <Text style={styles.requestBloodGroup}>{request.bloodGroup}</Text>
                <Text style={styles.requestUrgency}>{request.urgency.toUpperCase()}</Text>
              </View>
              <Text style={styles.requestPatient}>{request.patientName}</Text>
              <Text style={styles.requestLocation}>
                {request.hospitalName}, {request.city}
              </Text>
              <Text style={styles.requestUnits}>{request.units} units needed</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#d32f2f",
    paddingTop: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  bold: {
    fontWeight: "600",
    color: "#333",
  },
  available: {
    color: "#4caf50",
  },
  cardButton: {
    backgroundColor: "#d32f2f",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },
  cardButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  requestCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  requestBloodGroup: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  requestUrgency: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ff9800",
    backgroundColor: "#fff3e0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  requestPatient: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  requestLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  requestUnits: {
    fontSize: 14,
    color: "#d32f2f",
    fontWeight: "600",
  },
});

export default HomeScreen;

