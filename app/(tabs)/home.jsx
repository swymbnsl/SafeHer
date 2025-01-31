import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUserContext } from "../../context/userContextProvider";
import {
  getActiveTrips,
  startSharingMyLocation,
  startLocationSharing,
  updateLocationSharingStatus,
} from "../../lib/supabase";

import ActiveTripCard from "../../components/ActiveTripCard";
import QuickActionButton from "../../components/QuickActionButton";

const Home = () => {
  const { user, isLoading } = useUserContext();
  const [activeTrips, setActiveTrips] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(false);
  const [locationInterval, setLocationInterval] = useState(null);

  useEffect(() => {
    loadTrips();

    // Start sharing my location
    const { stopSharing } = startSharingMyLocation();

    // Cleanup on unmount
    return () => {
      if (locationInterval) {
        locationInterval();
      }
      if (stopSharing) {
        stopSharing();
      }
    };
  }, []);

  const loadTrips = async () => {
    try {
      // Get active trips
      const tripsData = await getActiveTrips();
      setActiveTrips(tripsData);
    } catch (error) {
      console.error("Error loading home data:", error);
      setToastMessage("Failed to load data");
      setShowToast(true);
    } finally {
      setIsLoadingTrips(false);
    }
  };

  const handleLocationSharing = async () => {
    try {
      if (!isSharing) {
        // Start sharing location
        const { stopSharing } = await startSharingMyLocation();
        setLocationInterval(stopSharing);
        setIsSharing(true);
      } else {
        // Stop sharing location
        if (locationInterval) {
          locationInterval();
          setLocationInterval(null);
        }
        // Update location sharing status in database
        await updateLocationSharingStatus(false);
        setIsSharing(false);
      }
    } catch (error) {
      console.error("Location sharing error:", error);
      setToastMessage("Failed to update location sharing");
      setShowToast(true);
    }
  };

  // Toast auto-hide effect
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-2 pb-4 bg-white shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-pbold text-gray-800">
              Hello, {user?.name || "Guest"} 👋
            </Text>
            <Text className="text-gray-600 font-pmedium">
              Ready for your next adventure?
            </Text>
          </View>
          <View className="flex-row items-center gap-x-2">
            <TouchableOpacity
              onPress={handleLocationSharing}
              className={`p-2 rounded-full ${
                isSharing ? "bg-violet-100" : "bg-gray-100"
              }`}
            >
              <Ionicons
                name={isSharing ? "location" : "location-outline"}
                size={24}
                color={isSharing ? "#6D28D9" : "#4B5563"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              className="relative p-2"
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#4B5563"
              />
              <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-violet-600 rounded-full" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Active Trips */}
        <View className="px-6 py-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-pbold text-gray-800">
              Active Trips
            </Text>
            <TouchableOpacity
              className="flex-row items-center bg-violet-100 px-3 py-1.5 rounded-full"
              onPress={() => router.push("/trips")}
            >
              <Text className="text-violet-700 font-pmedium mr-1">
                View All
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#6D28D9" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6 -mx-6 px-6 py-1"
          >
            {isLoadingTrips ? (
              <Text className="text-gray-500">Loading trips...</Text>
            ) : activeTrips.length > 0 ? (
              activeTrips
                .filter((trip) => trip.created_by !== user?.id)
                .slice(0, 5)
                .map((trip) => (
                  <View key={trip.id} className="mb-4">
                    <ActiveTripCard
                      id={trip.id}
                      name={trip.name}
                      posterName={trip.users.name}
                      posterAvatar={trip.users.avatar}
                      posterInterests={trip.desired_interests}
                      start_time={trip.start_time}
                      end_time={trip.end_time}
                      distance={trip.distance}
                      companions={trip.max_companions}
                      image={trip.image}
                      location={trip.location}
                      userLocation={user?.location}
                      age={user?.age}
                      createdBy={trip.created_by}
                      isFriend={user?.friends?.includes(trip.created_by)}
                      onRequestSent={(message) => {
                        setToastMessage(message);
                        setShowToast(true);
                      }}
                    />
                  </View>
                ))
            ) : (
              <Text className="text-gray-500">No active trips found</Text>
            )}
          </ScrollView>

          {/* Quick Actions */}
          <View className="mb-6">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Quick Actions
            </Text>
            <View className="flex-row justify-between w-full gap-x-3">
              <View className="flex-1">
                <QuickActionButton
                  icon="add-circle"
                  label="Create Trip"
                  onPress={() => router.push("/new-trip")}
                />
              </View>
              <View className="flex-1">
                <QuickActionButton
                  icon="search"
                  label="Find Trips"
                  onPress={() => router.push("/trips")}
                />
              </View>
              <View className="flex-1">
                <QuickActionButton
                  icon="map"
                  label="My Trips"
                  onPress={() => router.push("/my-trips")}
                />
              </View>
            </View>
          </View>

          {/* Location Sharing Status */}
          <View className="mb-6">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Location Sharing
            </Text>
            <View className="bg-white p-4 rounded-xl shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    className={`p-2 rounded-full ${
                      isSharing ? "bg-violet-100" : "bg-gray-100"
                    }`}
                  >
                    <Ionicons
                      name={isSharing ? "location" : "location-outline"}
                      size={24}
                      color={isSharing ? "#6D28D9" : "#4B5563"}
                    />
                  </View>
                  <View className="ml-3">
                    <Text className="font-pbold text-gray-800">
                      {isSharing ? "Currently Sharing" : "Location Sharing Off"}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {isSharing
                        ? "Your location is visible to trip companions"
                        : "Enable to share your location"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleLocationSharing}
                  className={`px-4 py-2 rounded-full ${
                    isSharing ? "bg-violet-100" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-pmedium ${
                      isSharing ? "text-violet-700" : "text-gray-600"
                    }`}
                  >
                    {isSharing ? "Stop" : "Start"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="h-20" />
        </View>
      </ScrollView>

      {/* Toast Message */}
      {showToast && (
        <View className="absolute bottom-20 left-0 right-0 mx-6">
          <View className="bg-gray-800 px-4 py-3 rounded-xl">
            <Text className="text-white text-center font-pmedium">
              {toastMessage}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Home;
