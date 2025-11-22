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
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { searchBloodRequests, createBloodRequest } from "../services/request.service";
import { useAuthStore } from "../store/authStore";
import { BloodRequest, BloodGroup } from "../types";

const BloodRequestsScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    bloodGroup: "" as BloodGroup | "",
    city: "",
    state: "",
    status: "pending",
  });

  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "" as BloodGroup | "",
    units: "",
    hospitalName: "",
    hospitalAddress: "",
    city: "",
    state: "",
    urgency: "medium" as "low" | "medium" | "high" | "critical",
    contactNumber: "",
    additionalInfo: "",
  });

  useEffect(() => {
    loadRequests();
  }, [filters]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const results = await searchBloodRequests(
        filters.bloodGroup || undefined,
        filters.city || undefined,
        filters.state || undefined,
        filters.status
      );
      setRequests(results);
    } catch (error) {
      console.error("Load requests error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!user) {
      Alert.alert("Error", "Please login first");
      return;
    }

    if (
      !formData.patientName ||
      !formData.bloodGroup ||
      !formData.units ||
      !formData.hospitalName ||
      !formData.hospitalAddress ||
      !formData.city ||
      !formData.state ||
      !formData.contactNumber
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await createBloodRequest({
        userId: user.uid,
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup,
        units: parseInt(formData.units),
        hospitalName: formData.hospitalName,
        hospitalAddress: formData.hospitalAddress,
        city: formData.city,
        state: formData.state,
        urgency: formData.urgency,
        contactNumber: formData.contactNumber,
        additionalInfo: formData.additionalInfo || undefined,
        status: "pending",
      });

      Alert.alert("Success", "Blood request created successfully!");
      setShowForm(false);
      setFormData({
        patientName: "",
        bloodGroup: "" as BloodGroup | "",
        units: "",
        hospitalName: "",
        hospitalAddress: "",
        city: "",
        state: "",
        urgency: "medium",
        contactNumber: "",
        additionalInfo: "",
      });
      loadRequests();
    } catch (error: any) {
      console.error("Create request error:", error);
      Alert.alert("Error", error.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "#d32f2f";
      case "high":
        return "#ff9800";
      case "medium":
        return "#ffc107";
      default:
        return "#4caf50";
    }
  };

  const renderRequest = ({ item }: { item: BloodRequest }) => (
    <TouchableOpacity style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View>
          <Text style={styles.requestBloodGroup}>{item.bloodGroup}</Text>
          <Text style={styles.requestUnits}>{item.units} units needed</Text>
        </View>
        <View
          style={[
            styles.urgencyBadge,
            { backgroundColor: getUrgencyColor(item.urgency) + "20" },
          ]}
        >
          <Text
            style={[
              styles.urgencyText,
              { color: getUrgencyColor(item.urgency) },
            ]}
          >
            {item.urgency.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.requestPatient}>Patient: {item.patientName}</Text>
      <Text style={styles.requestHospital}>{item.hospitalName}</Text>
      <Text style={styles.requestLocation}>
        📍 {item.hospitalAddress}, {item.city}, {item.state}
      </Text>
      <Text style={styles.requestContact}>📞 {item.contactNumber}</Text>
      {item.additionalInfo && (
        <Text style={styles.requestInfo}>{item.additionalInfo}</Text>
      )}
      <View style={styles.requestFooter}>
        <Text style={styles.requestStatus}>
          Status: <Text style={styles.statusText}>{item.status}</Text>
        </Text>
        <Text style={styles.requestDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Blood Requests</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonText}>
            {showForm ? "Cancel" : "+ New Request"}
          </Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <ScrollView style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Blood Request</Text>
          <TextInput
            style={styles.input}
            placeholder="Patient Name *"
            value={formData.patientName}
            onChangeText={(text) => setFormData({ ...formData, patientName: text })}
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.bloodGroup}
              onValueChange={(value) =>
                setFormData({ ...formData, bloodGroup: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Blood Group *" value="" />
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
          <TextInput
            style={styles.input}
            placeholder="Units Required *"
            value={formData.units}
            onChangeText={(text) => setFormData({ ...formData, units: text })}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Hospital Name *"
            value={formData.hospitalName}
            onChangeText={(text) =>
              setFormData({ ...formData, hospitalName: text })
            }
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Hospital Address *"
            value={formData.hospitalAddress}
            onChangeText={(text) =>
              setFormData({ ...formData, hospitalAddress: text })
            }
            multiline
            numberOfLines={3}
          />
          <TextInput
            style={styles.input}
            placeholder="City *"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="State *"
            value={formData.state}
            onChangeText={(text) => setFormData({ ...formData, state: text })}
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.urgency}
              onValueChange={(value) =>
                setFormData({ ...formData, urgency: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Low" value="low" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="High" value="high" />
              <Picker.Item label="Critical" value="critical" />
            </Picker>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Contact Number *"
            value={formData.contactNumber}
            onChangeText={(text) =>
              setFormData({ ...formData, contactNumber: text })
            }
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional Information"
            value={formData.additionalInfo}
            onChangeText={(text) =>
              setFormData({ ...formData, additionalInfo: text })
            }
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

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
              <Picker.Item label="All" value="" />
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
      </ScrollView>

      {loading && !showForm ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d32f2f" />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No requests found</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  addButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#d32f2f",
    fontSize: 14,
    fontWeight: "600",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 15,
    maxHeight: 500,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: "#d32f2f",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  listContainer: {
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  requestBloodGroup: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  requestUnits: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  requestPatient: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  requestHospital: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontWeight: "500",
  },
  requestLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  requestContact: {
    fontSize: 14,
    color: "#d32f2f",
    fontWeight: "600",
    marginBottom: 5,
  },
  requestInfo: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 10,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  requestStatus: {
    fontSize: 12,
    color: "#999",
  },
  statusText: {
    fontWeight: "600",
    color: "#333",
  },
  requestDate: {
    fontSize: 12,
    color: "#999",
  },
  emptyContainer: {
    padding: 50,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
});

export default BloodRequestsScreen;

