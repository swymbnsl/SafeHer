import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, parse } from "date-fns";
import Toast from "@/components/Toast";
import * as ImagePicker from "expo-image-picker";
import { updateTrip } from "@/lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserContext } from "@/context/userContextProvider";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

const EditTrip = () => {
  const router = useRouter();
  const { tripId, tripData: tripDataParam } = useLocalSearchParams();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [tripData, setTripData] = useState({
    id: "",
    name: "",
    startDate: new Date(),
    endDate: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    companions: "1",
    description: "",
    location: "",
    interests: [],
    image: null,
    coordinates: null,
  });
  const { user } = useUserContext();

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    if (tripDataParam) {
      try {
        const parsedTripData = JSON.parse(tripDataParam);
        setTripData({
          ...parsedTripData,
          startDate: new Date(parsedTripData.date),
          endDate: new Date(parsedTripData.date),
          startTime: new Date(parsedTripData.time),
          endTime: new Date(parsedTripData.time),
          interests: parsedTripData.interests || [],
        });
      } catch (error) {
        console.error("Error parsing trip data:", error);
        setError("Failed to load trip data");
      }
    }
  }, [tripDataParam]);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);

  const handleLocationChange = (text) => {
    setTripData((prev) => ({ ...prev, location: text }));
    setShowSuggestions(true);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(async () => {
      if (!text.trim()) {
        setLocationSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            text
          )}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        setLocationSuggestions(data.predictions);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    }, 500);

    setTypingTimeout(newTimeout);
  };

  const handleLocationSelect = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.result && data.result.geometry) {
        const { lat, lng } = data.result.geometry.location;
        setTripData((prev) => ({
          ...prev,
          location: locationSuggestions.find((s) => s.place_id === placeId)
            .description,
          coordinates: { lat, lng },
        }));
      }

      setShowSuggestions(false);
      setLocationSuggestions([]);
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(Platform.OS === "ios");
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
      setTripData((prev) => ({
        ...prev,
        startDate: selectedDate,
        endDate: selectedDate > prev.endDate ? selectedDate : prev.endDate,
      }));
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      if (selectedDate < tripData.startDate) {
        setError("End date cannot be before start date");
        return;
      }
      setError("");
      setTripData((prev) => ({ ...prev, endDate: selectedDate }));
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setTripData((prev) => ({ ...prev, startTime: selectedTime }));
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setTripData((prev) => ({ ...prev, endTime: selectedTime }));
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setTripData((prev) => ({
      ...prev,
      interests: prev.interests.filter(
        (interest) => interest !== interestToRemove
      ),
    }));
  };

  const handleAddInterest = () => {
    if (interestInput.trim()) {
      const newInterest = interestInput.trim();
      if (!tripData.interests.includes(newInterest)) {
        setTripData((prev) => ({
          ...prev,
          interests: [...prev.interests, newInterest],
        }));
      }
      setInterestInput("");
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      setError("Permission to access media library is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const img = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(img.uri, {
        encoding: "base64",
      });
      const filePath = `${user.user_id}/${new Date().getTime()}.${
        img.type === "image" ? "png" : "mp4"
      }`;
      const contentType = img.type === "image" ? "image/png" : "video/mp4";
      setTripData((prev) => ({
        ...prev,
        image: {
          img,
          base64,
          filePath,
          contentType,
        },
      }));
    }
  };

  const handleUpdateTrip = async () => {
    if (!tripData.name || !tripData.companions) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const startDateTime = new Date(tripData.startDate);
      const endDateTime = new Date(tripData.endDate);
      const startTime = new Date(tripData.startTime);
      const endTime = new Date(tripData.endTime);

      startDateTime.setHours(startTime.getHours());
      startDateTime.setMinutes(startTime.getMinutes());
      endDateTime.setHours(endTime.getHours());
      endDateTime.setMinutes(endTime.getMinutes());

      const updatedTrip = {
        id: tripData.id,
        name: tripData.name,
        location: tripData.location,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        description: tripData.description,
        max_companions: parseInt(tripData.companions),
        desired_interests: tripData.interests,
        image: tripData.image,
        coordinates: tripData.coordinates,
      };

      await updateTrip(updatedTrip);
      setToastMessage("Trip updated successfully!");
      setShowToast(true);

      setTimeout(() => {
        router.replace("/(tabs)/my-trips");
      }, 1500);
    } catch (error) {
      console.error("Update error:", error);
      setError("Failed to update trip");
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gray-50 p-2 rounded-xl"
          >
            <Ionicons name="arrow-back" size={24} color="#4a3b6b" />
          </TouchableOpacity>
          <Text className="text-xl font-pbold text-left w-full ml-3 text-gray-900">
            Edit Trip
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {error && (
            <Text className="text-red-500 mb-4 font-pmedium">{error}</Text>
          )}

          {/* Trip Name */}
          <View className="mb-6">
            <Text className="text-gray-700 font-pmedium mb-2">Trip Name</Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-gray-800 font-pmedium"
              value={tripData.name}
              onChangeText={(text) => setTripData({ ...tripData, name: text })}
              placeholder="Enter trip name"
            />
          </View>

          {/* Location */}
          <View className="mb-6 relative">
            <Text className="text-gray-700 font-pmedium mb-2">Location</Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-gray-800 font-pmedium"
              value={tripData.location}
              onChangeText={handleLocationChange}
              placeholder="Enter location"
            />

            {/* Location Suggestions */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <View className="absolute top-full left-0 right-0 bg-white rounded-xl mt-1 shadow-lg z-50 border border-gray-100">
                <ScrollView className="max-h-48">
                  {locationSuggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion.place_id}
                      className="p-4 border-b border-gray-100"
                      onPress={() => handleLocationSelect(suggestion.place_id)}
                    >
                      <Text className="text-gray-800 font-pmedium">
                        {suggestion.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Date & Time with more spacing */}
          <View className="mb-6">
            <Text className="text-gray-700 font-pmedium mb-2">Start Date</Text>
            <TouchableOpacity
              onPress={() => setShowStartDatePicker(true)}
              className="bg-gray-50 rounded-xl p-4 flex-row items-center justify-between"
            >
              <Text className="text-gray-800 font-pmedium">
                {format(tripData.startDate, "do MMMM yyyy")}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#4a3b6b" />
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-pmedium mb-2">End Date</Text>
            <TouchableOpacity
              onPress={() => setShowEndDatePicker(true)}
              className="bg-gray-50 rounded-xl p-4 flex-row items-center justify-between"
            >
              <Text className="text-gray-800 font-pmedium">
                {format(tripData.endDate, "do MMMM yyyy")}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#4a3b6b" />
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-pmedium mb-2">Start Time</Text>
            <TouchableOpacity
              onPress={() => setShowStartTimePicker(true)}
              className="bg-gray-50 rounded-xl p-4 flex-row items-center justify-between"
            >
              <Text className="text-gray-800 font-pmedium">
                {format(tripData.startTime, "h:mm a")}
              </Text>
              <Ionicons name="time-outline" size={20} color="#4a3b6b" />
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-pmedium mb-2">End Time</Text>
            <TouchableOpacity
              onPress={() => setShowEndTimePicker(true)}
              className="bg-gray-50 rounded-xl p-4 flex-row items-center justify-between"
            >
              <Text className="text-gray-800 font-pmedium">
                {format(tripData.endTime, "h:mm a")}
              </Text>
              <Ionicons name="time-outline" size={20} color="#4a3b6b" />
            </TouchableOpacity>
          </View>

          {/* Companions */}
          <View className="mb-6">
            <Text className="text-gray-700 font-pmedium mb-2">
              Number of Companions (1-5)
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-gray-800 font-pmedium"
              keyboardType="numeric"
              value={tripData.companions}
              onChangeText={(text) =>
                setTripData({ ...tripData, companions: text })
              }
              placeholder="Enter number of companions"
            />
          </View>

          {/* Interests */}
          <View className="mb-8">
            <Text className="text-gray-900 font-pbold text-lg mb-3">
              Desired Interests
            </Text>
            <View className="flex-row items-center space-x-2 mb-3">
              <TextInput
                className="flex-1 bg-gray-50 rounded-xl p-4 text-gray-800 font-pmedium text-base"
                placeholder="Add an interest"
                value={interestInput}
                onChangeText={setInterestInput}
                onSubmitEditing={handleAddInterest}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={handleAddInterest}
                className="bg-violet-600 p-4 rounded-xl"
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {tripData.interests.map((interest) => (
                <View
                  key={interest}
                  className="bg-violet-600 px-4 py-2 rounded-full flex-row items-center"
                >
                  <Text className="text-white font-pbold mr-2">{interest}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveInterest(interest)}
                    className="p-1"
                    accessibilityLabel={`Remove ${interest}`}
                  >
                    <Ionicons name="close-circle" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Trip Image */}
          <View className="mb-6">
            <Text className="text-gray-700 font-pmedium mb-2">Trip Image</Text>
            <TouchableOpacity
              onPress={handleImagePick}
              className="bg-gray-50 rounded-xl p-4 items-center justify-center border-2 border-dashed border-gray-200"
              style={{ height: 200 }}
            >
              {tripData.image ? (
                <Image
                  source={{ uri: tripData.image?.img?.uri }}
                  className="w-full h-full rounded-lg"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <Ionicons name="camera-outline" size={40} color="#6B7280" />
                  <Text className="text-gray-500 font-pmedium mt-2">
                    Tap to add an image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text className="text-gray-700 font-pmedium mb-2">Description</Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-gray-800 font-pmedium min-h-[120]"
              multiline
              numberOfLines={4}
              value={tripData.description}
              onChangeText={(text) =>
                setTripData({ ...tripData, description: text })
              }
              placeholder="Enter trip description"
            />
          </View>

          {/* Update Button */}
          <TouchableOpacity
            className="bg-violet-600 rounded-xl py-4 mb-6"
            onPress={() => setShowConfirm(true)}
          >
            <Text className="text-white font-pbold text-center text-lg">
              Update Trip
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date & Time Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={tripData.startDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={tripData.endDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleEndDateChange}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={tripData.startTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleStartTimeChange}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={tripData.endTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleEndTimeChange}
        />
      )}

      {/* Confirmation Modal */}
      <Modal transparent visible={showConfirm} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-2xl p-6 w-full">
            <Text className="text-xl font-pbold text-gray-800 mb-4 text-center">
              Update Trip?
            </Text>
            <Text className="text-gray-600 font-pmedium mb-6 text-center">
              Are you sure you want to update this trip?
            </Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="flex-1 bg-violet-600 py-3 rounded-xl"
                onPress={handleUpdateTrip}
              >
                <Text className="text-white font-pbold text-center">
                  Confirm
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-gray-100 py-3 rounded-xl"
                onPress={() => setShowConfirm(false)}
              >
                <Text className="text-gray-600 font-pbold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {showToast && (
        <Toast message={toastMessage} onHide={() => setShowToast(false)} />
      )}
    </View>
  );
};

export default EditTrip;
