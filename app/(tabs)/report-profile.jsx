import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "@/components/CustomButton";
import { Picker } from "@react-native-picker/picker";
import { getActiveTrips, submitReport } from "@/lib/supabase";

const ReportFriend = () => {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const initialReportState = {
    selectedReason: "",
    customReason: "",
    selectedTrip: "",
  };

  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(initialReportState);
  const { selectedReason, customReason, selectedTrip } = reportData;
  const [trips, setTrips] = useState([]);

  const reportReasons = [
    { id: "not_girl", label: "Not a Girl" },
    { id: "rude", label: "Rude Behavior" },
    { id: "inappropriate", label: "Inappropriate Content/Behavior" },
    { id: "harassment", label: "Harassment" },
    { id: "fake_profile", label: "Fake Profile" },
    { id: "others", label: "Others" },
  ];

  useEffect(() => {
    loadTrips();
  }, [userId]);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      const allTrips = await getActiveTrips();
      // Filter trips where created_by matches userId
      const userTrips = allTrips.filter((trip) => trip.created_by === userId);
      setTrips(userTrips || []);
    } catch (error) {
      console.error("Error loading trips:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const reportData = {
        userId,
        tripId: selectedTrip,
        reason: selectedReason,
        details: customReason,
      };

      await submitReport(reportData);

      // Reset form state
      setReportData(initialReportState);

      // Show success message
      Alert.alert(
        "Report Submitted",
        "Thank you for your report. We will review it shortly.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit report. Please try again.");
      console.error("Error submitting report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-violet-600 p-4 rounded-b-[30px]">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-pbold text-white ml-2">
            Report User
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Trip Selection */}
        <View className="mb-6">
          <Text className="text-gray-700 font-pmedium mb-2">Select Trip</Text>
          <View className="border border-gray-200 rounded-xl overflow-hidden">
            <Picker
              selectedValue={selectedTrip}
              onValueChange={(itemValue) =>
                setReportData({ ...reportData, selectedTrip: itemValue })
              }
              className="bg-white"
            >
              <Picker.Item label="Select a trip" value="" />
              {trips.map((trip) => (
                <Picker.Item key={trip.id} label={trip.name} value={trip.id} />
              ))}
            </Picker>
          </View>
          {trips.length === 0 && !isLoading && (
            <Text className="text-sm text-gray-500 mt-2">
              No trips found for this user
            </Text>
          )}
        </View>

        {/* Report Reason */}
        <View className="mb-6">
          <Text className="text-gray-700 font-pmedium mb-2">
            Reason for Report
          </Text>
          <View className="border border-gray-200 rounded-xl overflow-hidden">
            <Picker
              selectedValue={selectedReason}
              onValueChange={(itemValue) =>
                setReportData({ ...reportData, selectedReason: itemValue })
              }
              className="bg-white"
            >
              <Picker.Item label="Select a reason" value="" />
              {reportReasons.map((reason) => (
                <Picker.Item
                  key={reason.id}
                  label={reason.label}
                  value={reason.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Custom Reason */}
        <View className="mb-6">
          <Text className="text-gray-700 font-pmedium mb-2">
            Additional Details
          </Text>
          <TextInput
            multiline
            numberOfLines={4}
            value={customReason}
            onChangeText={(text) =>
              setReportData({ ...reportData, customReason: text })
            }
            placeholder="Please provide more details about your report..."
            className="border border-gray-200 rounded-xl p-4 text-gray-700 bg-white"
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <CustomButton
          title="Submit Report"
          onPress={handleSubmit}
          isLoading={isLoading}
          isDisabled={!selectedTrip || !selectedReason}
          className="mb-6"
          textClassName="text-white"
        />

        {/* Warning Text */}
        <Text className="text-sm text-gray-500 text-center mb-6">
          False reports may result in account suspension. Please ensure your
          report is accurate and truthful.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportFriend;
