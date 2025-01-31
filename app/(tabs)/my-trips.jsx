import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ActiveTripCard from "../../components/ActiveTripCard";
import { getUserTrips, deleteTrip } from "../../lib/supabase";
import { useFocusEffect } from "@react-navigation/native";

const MyTrips = () => {
  const router = useRouter();
  const [userTrips, setUserTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleDeleteTrip = (tripId) => {
    setSelectedTripId(tripId);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTrip(selectedTripId);
      setUserTrips(userTrips.filter((trip) => trip.id !== selectedTripId));
      setIsDeleteModalVisible(false);
    } catch (error) {
      // We'll handle this error in a separate modal in a future update
      console.error("Failed to delete trip:", error);
    }
  };

  const handleEditTrip = (trip) => {
    // Format the trip data before navigation
    const formattedTrip = {
      id: trip.id,
      name: trip.name,
      location: trip.location,
      date: new Date(trip.start_time),
      time: new Date(trip.start_time),
      companions: String(trip.max_companions),
      description: trip.description || "",
      interests: trip.desired_interests || [],
      image: trip.image || null,
      coordinates: trip.coordinates,
    };

    router.push({
      pathname: "/(tabs)/edit-trip",
      params: {
        tripId: trip.id,
        tripData: JSON.stringify(formattedTrip),
      },
    });
  };

  useFocusEffect(
    useCallback(() => {
      const loadUserTrips = async () => {
        try {
          setIsLoading(true);
          const trips = await getUserTrips();
          setUserTrips(trips);
        } catch (error) {
          console.error("Failed to load trips:", error);
          setErrorMessage("Failed to load trips");
          setIsErrorModalVisible(true);
        } finally {
          setIsLoading(false);
        }
      };

      loadUserTrips();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-pbold text-gray-900">My Trips</Text>
          <TouchableOpacity
            className="bg-violet-100 p-2 rounded-xl"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#7C3AED" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6">
          {isLoading ? (
            <Text className="text-gray-500 text-center py-4">
              Loading trips...
            </Text>
          ) : userTrips.length > 0 ? (
            userTrips.map((trip) => (
              <View key={trip.id} className="mb-4">
                <ActiveTripCard
                  name={trip.name}
                  posterName={trip.users.name}
                  posterAvatar={trip.users.avatar}
                  posterInterests={trip.desired_interests}
                  start_time={trip.start_time}
                  end_time={trip.end_time}
                  distance={trip.distance}
                  companions={trip.max_companions}
                  image={trip.image}
                  coordinates={trip.location}
                  fullWidth={true}
                  hideActions={true}
                />
                <View className="flex-row justify-evenly mt-3 gap-3 px-1">
                  <TouchableOpacity
                    className="flex-row items-center bg-violet-100 px-4 py-2.5 rounded-xl flex-1"
                    onPress={() => handleEditTrip(trip)}
                  >
                    <Ionicons name="create-outline" size={18} color="#7C3AED" />
                    <Text className="ml-2 font-pmedium text-violet-700">
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-row items-center bg-red-100 px-4 py-2.5 rounded-xl flex-1"
                    onPress={() => handleDeleteTrip(trip.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    <Text className="ml-2 font-pmedium text-red-600">
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View className="py-8 items-center">
              <Text className="text-gray-500 font-pmedium text-center">
                You haven't created any trips yet
              </Text>
              <TouchableOpacity
                className="mt-4 bg-violet-600 px-6 py-3 rounded-xl"
                onPress={() => router.push("/(tabs)/new-trip")}
              >
                <Text className="text-white font-pmedium">Create a Trip</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Error Modal */}
      <Modal
        transparent
        visible={isErrorModalVisible}
        animationType="fade"
        onRequestClose={() => setIsErrorModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-xl font-pbold text-gray-800 mb-4 text-center">
              Error
            </Text>
            <Text className="text-gray-600 font-pmedium mb-6 text-center">
              {errorMessage}
            </Text>
            <TouchableOpacity
              className="bg-violet-600 py-3 rounded-xl"
              onPress={() => setIsErrorModalVisible(false)}
            >
              <Text className="text-white font-pbold text-center">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-6 rounded-2xl w-[80%] max-w-sm">
            <Text className="text-xl font-pbold text-gray-900 mb-4">
              Delete Trip
            </Text>
            <Text className="text-gray-600 mb-6">
              Are you sure you want to delete this trip?
            </Text>
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                className="px-4 py-2 rounded-xl bg-gray-100"
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text className="font-pmedium text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 rounded-xl bg-red-500"
                onPress={handleConfirmDelete}
              >
                <Text className="font-pmedium text-white">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MyTrips;
