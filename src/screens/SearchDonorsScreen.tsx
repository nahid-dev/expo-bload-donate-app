import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { searchDonors } from "../services/donor.service";
import { Donor, BloodGroup } from "../types";

const SearchDonorsScreen = ({ navigation }: any) => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    bloodGroup: "" as BloodGroup | "",
    city: "",
    state: "",
    isAvailable: true,
  });

  useEffect(() => {
    loadDonors();
  }, [filters]);

  const loadDonors = async () => {
    setLoading(true);
    try {
      const results = await searchDonors(
        filters.bloodGroup || undefined,
        filters.city || undefined,
        filters.state || undefined,
        filters.isAvailable
      );
      setDonors(results);
    } catch (error) {
      console.error("Search donors error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderDonor = ({ item }: { item: Donor }) => {
    const age = item.dateOfBirth
      ? new Date().getFullYear() - new Date(item.dateOfBirth).getFullYear()
      : null;

    return (
      <TouchableOpacity style={styles.donorCard}>
        <View style={styles.donorHeader}>
          <View>
            <Text style={styles.donorName}>{item.name}</Text>
            <Text style={styles.donorDetails}>
              {item.bloodGroup} {age && `• ${age} years`} • {item.gender}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              item.isAvailable ? styles.availableBadge : styles.unavailableBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.isAvailable ? styles.availableText : styles.unavailableText,
              ]}
            >
              {item.isAvailable ? "Available" : "Not Available"}
            </Text>
          </View>
        </View>
        <Text style={styles.donorLocation}>
          📍 {item.address}, {item.city}, {item.state} - {item.pincode}
        </Text>
        <Text style={styles.donorPhone}>📞 {item.phoneNumber}</Text>
        {item.lastDonationDate && (
          <Text style={styles.donationInfo}>
            Last donation: {new Date(item.lastDonationDate).toLocaleDateString()}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Donors</Text>
      </View>

      <ScrollView style={styles.filtersContainer}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Blood Group</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={filters.bloodGroup}
              onValueChange={(value) =>
                setFilters({ ...filters, bloodGroup: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="All Blood Groups" value="" />
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
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>City</Text>
          <TextInput
            style={styles.input}
            value={filters.city}
            onChangeText={(text) => setFilters({ ...filters, city: text })}
            placeholder="Enter city"
          />
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>State</Text>
          <TextInput
            style={styles.input}
            value={filters.state}
            onChangeText={(text) => setFilters({ ...filters, state: text })}
            placeholder="Enter state"
          />
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Availability</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={filters.isAvailable}
              onValueChange={(value) =>
                setFilters({ ...filters, isAvailable: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Available Only" value={true} />
              <Picker.Item label="All Donors" value={false} />
            </Picker>
          </View>
        </View>
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d32f2f" />
        </View>
      ) : (
        <FlatList
          data={donors}
          renderItem={renderDonor}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No donors found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters
              </Text>
            </View>
          }
        />
      )}
    </View>
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
  filtersContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  listContainer: {
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
  donorCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  donorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  donorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  donorDetails: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  availableBadge: {
    backgroundColor: "#e8f5e9",
  },
  unavailableBadge: {
    backgroundColor: "#ffebee",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  availableText: {
    color: "#4caf50",
  },
  unavailableText: {
    color: "#f44336",
  },
  donorLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  donorPhone: {
    fontSize: 14,
    color: "#d32f2f",
    fontWeight: "600",
    marginBottom: 5,
  },
  donationInfo: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  emptyContainer: {
    padding: 50,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
  },
});

export default SearchDonorsScreen;

