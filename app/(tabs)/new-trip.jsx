import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "@/components/Toast";

const NewTrip = () => {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [tripData, setTripData] = useState({
    id: Date.now().toString(),
    name: "",
    date: new Date(),
    time: new Date(),
    companions: "",
    description: "",
    isPosted: true,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      if (selectedDate > maxDate) {
        setError("Cannot schedule trips more than 14 days in advance");
        return;
      }
      if (selectedDate < new Date()) {
        setError("Cannot schedule trips in the past");
        return;
      }
      setError("");
      setTripData((prev) => ({ ...prev, date: selectedDate }));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setTripData((prev) => ({ ...prev, time: selectedTime }));
    }
  };

  const handleCreateTrip = () => {
    if (!tripData.name || !tripData.companions) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    setShowConfirm(true);
  };

  const confirmCreateTrip = async () => {
    try {
      const existingTrips = await AsyncStorage.getItem("trips");
      const trips = existingTrips ? JSON.parse(existingTrips) : [];

      const newTrip = {
        ...tripData,
        date: format(new Date(tripData.date), "do MMMM yyyy"),
        time: format(new Date(tripData.time), "h:mm a"),
      };

      trips.push(newTrip);
      await AsyncStorage.setItem("trips", JSON.stringify(trips));

      setShowConfirm(false);
      setToastMessage("Trip created successfully!");
      setShowToast(true);
      setTimeout(() => {
        router.replace("/(tabs)/trips");
      }, 1500);
    } catch (error) {
      Alert.alert("Error", "Failed to create trip");
    }
  };

  return (
    <View className="flex-1 bg-[#fff4ff]">
      <View className="flex-row justify-between items-center px-6 pt-14 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#4a3b6b" />
          <Text className="text-xl font-pbold text-[#4a3b6b] ml-2">
            New Trip
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg border border-[#f0e6ff]">
          {error ? (
            <Text className="text-red-500 mb-4 font-pmedium">{error}</Text>
          ) : null}

          <Text className="text-[#6f5c91] font-pmedium mb-2">Trip Name</Text>
          <TextInput
            className="bg-[#fff4ff] rounded-xl p-3 text-[#4a3b6b] font-pmedium mb-4"
            placeholder="Enter trip name"
            value={tripData.name}
            onChangeText={(text) => setTripData({ ...tripData, name: text })}
          />

          <Text className="text-[#6f5c91] font-pmedium mb-2">Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-[#fff4ff] rounded-xl p-3 mb-4"
          >
            <Text className="text-[#4a3b6b] font-pmedium">
              {format(tripData.date, "do MMMM yyyy")}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={tripData.date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              minimumDate={new Date()}
              maximumDate={maxDate}
            />
          )}

          <Text className="text-[#6f5c91] font-pmedium mb-2">Time</Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="bg-[#fff4ff] rounded-xl p-3 mb-4"
          >
            <Text className="text-[#4a3b6b] font-pmedium">
              {format(tripData.time, "h:mm a")}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={tripData.time}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeChange}
            />
          )}

          <Text className="text-[#6f5c91] font-pmedium mb-2">
            Number of Companions
          </Text>
          <TextInput
            className="bg-[#fff4ff] rounded-xl p-3 text-[#4a3b6b] font-pmedium mb-4"
            placeholder="Enter number of companions"
            keyboardType="numeric"
            value={tripData.companions}
            onChangeText={(text) =>
              setTripData({ ...tripData, companions: text })
            }
          />

          <Text className="text-[#6f5c91] font-pmedium mb-2">Description</Text>
          <TextInput
            className="bg-[#fff4ff] rounded-xl p-3 text-[#4a3b6b] font-pmedium mb-6"
            placeholder="Enter trip description"
            multiline
            numberOfLines={4}
            value={tripData.description}
            onChangeText={(text) =>
              setTripData({ ...tripData, description: text })
            }
          />

          <TouchableOpacity
            onPress={handleCreateTrip}
            className="bg-[#9f86ff] p-4 rounded-xl mt-6"
          >
            <Text className="text-white font-pbold text-center">
              Create Trip
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showConfirm && (
        <Modal transparent animationType="fade">
          <View className="flex-1 bg-black/50 justify-center items-center p-6">
            <View className="bg-white rounded-2xl p-6 w-full">
              <Text className="text-lg font-pbold text-[#4a3b6b] mb-4 text-center">
                Confirm Trip Creation
              </Text>
              <Text className="text-[#6f5c91] font-pmedium mb-6 text-center">
                Are you sure you want to create this trip?
              </Text>
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  className="flex-1 bg-[#9f86ff] rounded-xl py-3 m-3"
                  onPress={confirmCreateTrip}
                >
                  <Text className="text-white font-pbold text-center">
                    Confirm
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-200 rounded-xl py-3 m-3"
                  onPress={() => setShowConfirm(false)}
                >
                  <Text className="text-[#4a3b6b] font-pbold text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showToast && (
        <Toast message={toastMessage} onHide={() => setShowToast(false)} />
      )}
    </View>
  );
};

export default NewTrip;
