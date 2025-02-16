import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ActiveTripCard from "../../components/ActiveTripCard";
import FiltersModal from "../../components/FiltersModal";
import { getActiveTrips } from "../../lib/supabase";
import { useUserContext } from "../../context/userContextProvider";

const Trips = () => {
  const router = useRouter();
  const { user } = useUserContext();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Initial filters state
  const [filters, setFilters] = useState({
    minDistance: "",
    maxDistance: "",
    ageRange: "any",
  });

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.round(d);
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Fetch trips only once on component mount
  useEffect(() => {
    const loadTrips = async () => {
      try {
        setIsLoadingTrips(true);
        const fetchedTrips = await getActiveTrips();

        // Calculate distance for each trip
        const tripsWithDistance = fetchedTrips.map((trip) => {
          let distance = null;
          if (user?.location && trip.location?.coordinates) {
            distance = calculateDistance(
              user.location.latitude,
              user.location.longitude,
              trip.location.coordinates.lat,
              trip.location.coordinates.lng
            );
          }
          return { ...trip, distance };
        });

        setTrips(tripsWithDistance);
        setFilteredTrips(tripsWithDistance);
      } catch (error) {
        console.log("Failed to load trips:", error);
        Alert.alert("Error", "Failed to load trips");
      } finally {
        setIsLoadingTrips(false);
      }
    };

    loadTrips();
  }, [user?.location]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      minDistance: "",
      maxDistance: "",
      ageRange: "any",
    });
  };

  // Apply filters whenever filters or trips change
  useEffect(() => {
    const filtered = trips
      .filter((trip) => trip.created_by !== user?.id)
      .filter((trip) => {
        // Distance filter
        if (filters.minDistance || filters.maxDistance) {
          const tripDistance = trip.distance || 0;
          const minDist = filters.minDistance ? Number(filters.minDistance) : 0;
          const maxDist = filters.maxDistance
            ? Number(filters.maxDistance)
            : Infinity;

          if (tripDistance < minDist || tripDistance > maxDist) {
            return false;
          }
        }

        // Age Range filter (keeping the original working logic)
        if (filters.ageRange !== "any") {
          const posterAge = trip.users?.age;
          if (!posterAge) return false;

          if (filters.ageRange === "36+") {
            return posterAge >= 36;
          } else {
            const [minAge, maxAge] = filters.ageRange.split("-").map(Number);
            return posterAge >= minAge && posterAge <= maxAge;
          }
        }

        return true;
      });

    setFilteredTrips(filtered);
  }, [trips, filters, user?.id]);

  // Debug logging
  useEffect(() => {}, [filters, filteredTrips]);

  const handleRequestSent = async (message) => {
    Alert.alert("Success", message);
    await loadTrips();
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedTrips = await getActiveTrips();
      // Calculate distance for each trip
      const tripsWithDistance = fetchedTrips.map((trip) => {
        let distance = null;
        if (user?.location && trip.location?.coordinates) {
          distance = calculateDistance(
            user.location.latitude,
            user.location.longitude,
            trip.location.coordinates.lat,
            trip.location.coordinates.lng
          );
        }
        return { ...trip, distance };
      });

      setTrips(tripsWithDistance);
      setFilteredTrips(tripsWithDistance);
    } catch (error) {
      console.log("Failed to refresh trips:", error);
      Alert.alert("Error", "Failed to refresh trips");
    } finally {
      setRefreshing(false);
    }
  }, [user?.location]);

  const loadTrips = async () => {
    try {
      setIsLoadingTrips(true);
      const fetchedTrips = await getActiveTrips();

      // Calculate distance for each trip
      const tripsWithDistance = fetchedTrips.map((trip) => {
        let distance = null;
        if (user?.location && trip.location?.coordinates) {
          distance = calculateDistance(
            user.location.latitude,
            user.location.longitude,
            trip.location.coordinates.lat,
            trip.location.coordinates.lng
          );
        }
        return { ...trip, distance };
      });

      setTrips(tripsWithDistance);
      setFilteredTrips(tripsWithDistance);
    } catch (error) {
      console.log("Failed to load trips:", error);
      Alert.alert("Error", "Failed to load trips");
    } finally {
      setIsLoadingTrips(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Fixed Header */}
      <View className="px-6 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-pbold text-gray-900">Trips</Text>
          <TouchableOpacity
            className="bg-violet-100 p-2 rounded-xl"
            onPress={() => router.push("/(tabs)/new-trip")}
          >
            <Ionicons name="add" size={24} color="#7C3AED" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
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
        <View className="px-6">
          {/* Search Bar */}
          <View className="mb-4">
            <View className="flex-row items-center bg-gray-50 rounded-xl p-3">
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 font-pregular text-gray-700"
                placeholder="Search places, interests..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Filter and My Trips Buttons */}
          <View className="space-y-3 mb-4">
            <TouchableOpacity
              className={`flex-row items-center justify-center py-3 px-4 rounded-xl ${
                showFilters ? "bg-violet-600" : "bg-gray-50"
              }`}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={showFilters ? "white" : "#6B7280"}
              />
              <Text
                className={`ml-2 font-pmedium ${
                  showFilters ? "text-white" : "text-gray-600"
                }`}
              >
                Filter Options
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-center py-3 px-4 rounded-xl bg-violet-600 mt-2"
              onPress={() => router.push("/my-trips")}
            >
              <Ionicons name="bookmark-outline" size={20} color="white" />
              <Text className="ml-2 font-pmedium text-white">My Trips</Text>
            </TouchableOpacity>
          </View>

          {/* Available Trips Section */}
          <View className="py-4">
            <Text className="text-lg font-psemibold text-gray-800 mb-4">
              Available Trips
            </Text>
            {isLoadingTrips ? (
              <Text className="text-gray-500 text-center py-4">
                Loading trips...
              </Text>
            ) : filteredTrips.length > 0 ? (
              filteredTrips.map((trip) => (
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
                    fullWidth={true}
                    onRequestSent={handleRequestSent}
                  />
                </View>
              ))
            ) : (
              <View className="py-8 items-center">
                <Text className="text-gray-500 font-pmedium text-center">
                  No trips match your filters
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Filters Modal */}
      <FiltersModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        handleFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />
    </SafeAreaView>
  );
};

export default Trips;
