import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Linking,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUserContext } from "../../context/userContextProvider";
import {
  getActiveTrips,
  startSharingMyLocation,
  startLocationSharing,
  updateLocationSharingStatus,
  getUserFromDb,
} from "../../lib/supabase";

import ActiveTripCard from "../../components/ActiveTripCard";
import QuickActionButton from "../../components/QuickActionButton";

const Home = () => {
  const { user, isLoading, fetchUser } = useUserContext();
  const [activeTrips, setActiveTrips] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(false);
  const [locationInterval, setLocationInterval] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check initial location sharing status and load trips
    const initializeScreen = async () => {
      try {
        // Get user data which includes sharing_location status
        const userData = await getUserFromDb();
        setIsSharing(userData.sharing_location || false);

        // If location was being shared, restart the sharing
        if (userData.sharing_location) {
          const stopSharingFn = await startSharingMyLocation();
          const subscription = startLocationSharing(
            userData.user_id,
            (location) => {
              console.log("Location updated:", location);
            }
          );

          setLocationInterval(() => {
            return async () => {
              subscription.unsubscribe();
              if (stopSharingFn) {
                await stopSharingFn();
              }
            };
          });
        }

        // Load trips
        await loadTrips();
      } catch (error) {
        console.log("Error initializing screen:", error);
        setToastMessage(error.message || "Failed to initialize screen");
        setShowToast(true);
      }
    };

    initializeScreen();

    // Cleanup function
    return () => {
      if (locationInterval) {
        locationInterval();
      }
    };
  }, []);

  const loadTrips = async () => {
    try {
      setIsLoadingTrips(true);
      const tripsData = await getActiveTrips();

      if (!tripsData) {
        throw new Error("No trips data received");
      }

      setActiveTrips(tripsData);
    } catch (error) {
      console.log("Error loading trips:", error.message);
      setToastMessage(error.message || "Failed to load trips data");
      setShowToast(true);
      setActiveTrips([]); // Set empty array as fallback
    } finally {
      setIsLoadingTrips(false);
    }
  };

  const handleLocationSharing = async () => {
    try {
      if (!user?.id) {
        throw new Error("You must be logged in to share location");
      }

      if (!isSharing) {
        // Start location sharing and store the subscription
        const subscription = startLocationSharing(user.id, async (location) => {
          console.log("Location updated:", location);
          // Handle location update if needed
        });

        // Start the location updates
        const stopSharingFn = await startSharingMyLocation();

        setLocationInterval(() => {
          // Cleanup function that handles both the subscription and interval
          return async () => {
            subscription.unsubscribe();
            if (stopSharingFn) {
              await stopSharingFn();
            }
          };
        });

        setIsSharing(true);
        setToastMessage("Location sharing started");
        setShowToast(true);
      } else {
        // Stop sharing
        if (locationInterval) {
          await locationInterval();
          setLocationInterval(null);
        }
        setIsSharing(false);
        setToastMessage("Location sharing stopped");
        setShowToast(true);
      }
    } catch (error) {
      console.log("Location sharing error:", error);
      setToastMessage(error.message || "Failed to update location sharing");
      setShowToast(true);
      setIsSharing(false);
      setLocationInterval(null);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${process.env.EXPO_PUBLIC_WEBPAGE_DOMAIN}/location?userId=${user?.id}`;
      await Share.share({
        message: `Track my location in real-time: ${shareUrl}`,
        url: shareUrl, // iOS only
      });
    } catch (error) {
      console.log("Error sharing:", error);
      setToastMessage("Failed to share location link");
      setShowToast(true);
    }
  };

  const handleRequestSent = async (message) => {
    setToastMessage(message);
    setShowToast(true);
    // Reload trips after request is sent
    await loadTrips();
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  }, [fetchUser]);

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
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#7C3AED"
            colors={["#7C3AED"]}
          />
        }
      >
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
                      age={trip.users.age}
                      createdBy={trip.created_by}
                      isFriend={user?.friends?.includes(trip.created_by)}
                      onRequestSent={handleRequestSent}
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
              <View className="flex-col">
                {/* Top Row with Icon and Toggle */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1 mr-3">
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
                    <View className="ml-3 flex-1">
                      <Text className="font-pbold text-gray-800">
                        {isSharing
                          ? "Currently Sharing"
                          : "Location Sharing Off"}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {isSharing
                          ? "Your location is visible to trip companions"
                          : "Enable to share your location"}
                      </Text>
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

                {/* Sharable URL Section */}
                {isSharing && (
                  <View className="mt-2 pt-3 border-t border-gray-100">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-sm text-gray-500 flex-1 mr-3">
                        Share this link to let others track your location:
                      </Text>
                      <TouchableOpacity
                        onPress={handleShare}
                        className="bg-violet-100 px-3 py-1.5 rounded-full flex-row items-center"
                      >
                        <Ionicons
                          name="share-outline"
                          size={16}
                          color="#6D28D9"
                        />
                        <Text className="text-violet-700 font-pmedium ml-1">
                          Share
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View className="bg-gray-50 p-3 rounded-lg mt-2">
                      <Text
                        className="text-sm text-violet-600 font-pmedium"
                        numberOfLines={1}
                      >
                        {`${process.env.EXPO_PUBLIC_WEBPAGE_DOMAIN}/location?userId=${user?.id}`}
                      </Text>
                    </View>
                  </View>
                )}

                {/* SOS Button Section */}
                <View className="mt-3 pt-3 border-t border-gray-100">
                  <TouchableOpacity
                    onPress={() => {
                      Linking.openURL("tel:1091");
                      setToastMessage("Calling Women Helpline...");
                      setShowToast(true);
                    }}
                    className="bg-red-100 p-4 rounded-xl flex-row items-center justify-center"
                    accessibilityLabel="Emergency SOS button to call women helpline"
                    accessibilityRole="button"
                  >
                    <Ionicons name="alert-circle" size={24} color="#DC2626" />
                    <Text className="text-red-600 font-pbold ml-2 text-lg">
                      SOS - Women Helpline
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-xs text-gray-500 text-center mt-2">
                    Press to instantly call Women Helpline (1091)
                  </Text>
                </View>
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
