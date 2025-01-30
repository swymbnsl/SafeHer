import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colours";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationPopup } from "./home";
import { SafeAreaView } from "react-native-safe-area-context";
import ActiveTripCard from "../../components/ActiveTripCard";
import FiltersModal from "../../components/FiltersModal";
import { getActiveTrips } from "../../lib/supabase";

const TripCard = ({ trip, onView, isUserTrip }) => {
  const [showViewModal, setShowViewModal] = useState(false);

  const ViewTripModal = () => (
    <Modal transparent={true} visible={showViewModal} animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-h-[80%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-pbold text-[#4a3b6b]">
              {trip.name}
            </Text>
            <TouchableOpacity onPress={() => setShowViewModal(false)}>
              <Ionicons name="close" size={24} color="#4a3b6b" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View className="space-y-4">
              <View>
                <Text className="text-[#6f5c91] font-pmedium">Date & Time</Text>
                <Text className="text-[#4a3b6b] font-psemibold mt-1">
                  {trip.date}, {trip.time}
                </Text>
              </View>

              <View>
                <Text className="text-[#6f5c91] font-pmedium">Companions</Text>
                <Text className="text-[#4a3b6b] font-psemibold mt-1">
                  {trip.companions} people joining
                </Text>
              </View>

              <View>
                <Text className="text-[#6f5c91] font-pmedium">Description</Text>
                <Text className="text-[#4a3b6b] font-psemibold mt-1">
                  {trip.description || "No description provided"}
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            className="bg-[#9f86ff] rounded-xl py-3 mt-6"
            onPress={() => setShowViewModal(false)}
          >
            <Text className="text-white font-pbold text-center">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View
      className="bg-white rounded-2xl p-4 mb-4"
      style={{
        shadowColor: "#7C3AED",
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-lg font-psemibold text-gray-800">
            {trip.name}
          </Text>
          <Text className="text-gray-500 font-plight">
            {trip.date} at {trip.time}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-violet-100 p-2 rounded-xl"
          onPress={() => setShowViewModal(true)}
        >
          <Ionicons name="chevron-forward" size={20} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center mb-3">
        <Ionicons name="location" size={16} color="#6B7280" />
        <Text className="text-gray-600 font-plight ml-1">{trip.location}</Text>
        <Text className="text-gray-400 font-plight ml-2">•</Text>
        <Text className="text-gray-600 font-plight ml-2">{trip.distance}</Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="people" size={16} color="#6B7280" />
          <Text className="text-gray-600 font-plight ml-1">
            {trip.companions} companions
          </Text>
        </View>
      </View>

      {/* New Interest Tags Section */}
      <View className="flex-row flex-wrap gap-2 mt-3">
        {trip.interests.map((interest, index) => (
          <View
            key={index}
            className="bg-violet-50 px-3 py-1 rounded-full border border-violet-100"
          >
            <Text className="text-violet-600 font-pmedium text-xs">
              {interest}
            </Text>
          </View>
        ))}
      </View>

      <ViewTripModal />
    </View>
  );
};

const Trips = () => {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");

  // Add filters state
  const [filters, setFilters] = useState({
    distance: "any",
    ageRange: "any",
    interests: [],
    profession: "any",
  });

  // Add handler for filter options
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  useEffect(() => {
    const loadTrips = async () => {
      try {
        setIsLoadingTrips(true);
        const fetchedTrips = await getActiveTrips();
        setTrips(fetchedTrips);
      } catch (error) {
        console.error("Failed to load trips:", error);
      } finally {
        setIsLoadingTrips(false);
      }
    };

    loadTrips();
  }, []);

  const handleViewTrip = (trip) => {
    // Handle view trip logic here instead of in TripCard
    setShowViewModal(true);
  };

  // Transform the trip data to match ActiveTripCard props
  const transformTripData = (trip) => ({
    name: trip.name,
    posterName: trip.poster.name,
    posterAvatar: trip.poster.avatar,
    posterAge: trip.poster.age || "25",
    posterInterests: trip.poster.interests,
    time: trip.start_time,
    returnTime: trip.end_time,
    distance: trip.distance,
    companions: trip.max_participants,
    image: trip.image,
    coordinates: trip.location,
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Fixed Header */}
      <View className="px-6 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-pbold text-gray-900">Trips</Text>
          <TouchableOpacity
            className="bg-violet-100 p-2 rounded-xl"
            onPress={() => router.push("/(tabs)/new_trip")}
          >
            <Ionicons name="add" size={24} color="#7C3AED" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
            ) : trips && trips.length > 0 ? (
              trips.map((trip) => (
                <View key={trip.id} className="mb-4">
                  <ActiveTripCard
                    name={trip.name}
                    posterName={trip.poster.name}
                    posterAvatar={trip.poster.avatar}
                    posterInterests={trip.poster.interests}
                    time={trip.start_time}
                    returnTime={trip.end_time}
                    distance={trip.distance}
                    companions={trip.max_participants}
                    image={trip.image}
                    coordinates={trip.location}
                    fullWidth={true}
                  />
                </View>
              ))
            ) : (
              <View className="py-8 items-center">
                <Text className="text-gray-500 font-pmedium text-center">
                  No trips available at the moment
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
        onReset={() =>
          setFilters({
            distance: "any",
            ageRange: "any",
            interests: [],
            profession: "any",
          })
        }
      />
    </SafeAreaView>
  );
};

export default Trips;
