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

const demoTrips = [
  {
    id: 1,
    name: "Evening Walk at Lodhi Garden",
    date: "Today",
    time: "5:00 PM",
    location: "Lodhi Garden",
    distance: "2.5 km away",
    companions: 3,
    interests: ["Walking", "Photography"],
    isPast: false,
  },
  {
    id: 2,
    name: "Coffee & Art Gallery Visit",
    date: "Tomorrow",
    time: "3:00 PM",
    location: "Kala Ghoda",
    distance: "4.2 km away",
    companions: 2,
    interests: ["Art", "Coffee"],
    isPast: false,
  },
  {
    id: 3,
    name: "Morning Yoga in Park",
    date: "26th Oct",
    time: "7:00 AM",
    location: "Deer Park",
    distance: "1.8 km away",
    companions: 4,
    interests: ["Yoga", "Wellness"],
    isPast: false,
  },
  {
    id: 4,
    name: "Street Food Tour",
    date: "27th Oct",
    time: "6:00 PM",
    location: "Chandni Chowk",
    distance: "5.5 km away",
    companions: 3,
    interests: ["Food", "Culture"],
    isPast: false,
  },
];

const Trips = () => {
  const router = useRouter();
  const [userTrips, setUserTrips] = useState([]);
  const [discoverTrips, setDiscoverTrips] = useState(demoTrips);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [activeFilter, setActiveFilter] = useState("all");

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
    // Load trips from AsyncStorage
    const loadTrips = async () => {
      try {
        const savedDiscoverTrips = await AsyncStorage.getItem("discoverTrips");
        if (savedDiscoverTrips) {
          setDiscoverTrips(JSON.parse(savedDiscoverTrips));
        } else {
          await AsyncStorage.setItem(
            "discoverTrips",
            JSON.stringify(demoTrips)
          );
          setDiscoverTrips(demoTrips);
        }
      } catch (error) {
        console.error("Failed to load trips:", error);
        setDiscoverTrips(demoTrips);
      }
    };

    loadTrips();
  }, []);

  const handleViewTrip = (trip) => {
    // Handle view trip logic here instead of in TripCard
    setShowViewModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-2 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-pbold text-gray-900">Trips</Text>
          <TouchableOpacity
            className="bg-violet-100 p-2 rounded-xl"
            onPress={() => router.push("/(tabs)/new_trip")}
          >
            <Ionicons name="add" size={24} color="#7C3AED" />
          </TouchableOpacity>
        </View>

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

        {/* Filter Button */}
        <TouchableOpacity
          className={`flex-row items-center justify-center py-3 px-4 rounded-xl mb-4 ${
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

        {/* Filter Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
        >
          <FilterTag
            label="All"
            active={activeFilter === "all"}
            onPress={() => setActiveFilter("all")}
          />
          <FilterTag
            label="Nearby"
            active={activeFilter === "nearby"}
            onPress={() => setActiveFilter("nearby")}
          />
          <FilterTag
            label="This Week"
            active={activeFilter === "thisWeek"}
            onPress={() => setActiveFilter("thisWeek")}
          />
          <FilterTag
            label="Popular"
            active={activeFilter === "popular"}
            onPress={() => setActiveFilter("popular")}
          />
        </ScrollView>
      </View>

      {/* Filter Modal */}
      <Modal
        transparent={true}
        visible={showFilters}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="bg-white rounded-t-3xl mt-auto p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-pbold text-gray-800">Filters</Text>
              <TouchableOpacity
                onPress={() =>
                  setFilters({
                    distance: "any",
                    ageRange: "any",
                    interests: [],
                    profession: "any",
                  })
                }
              >
                <Text className="text-violet-600 font-pmedium">Reset All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-[70vh]">
              {/* Distance Filter */}
              <View className="mb-6">
                <Text className="text-sm font-pmedium text-gray-600 mb-3">
                  Distance
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <FilterOption
                    label="< 5km"
                    selected={filters.distance === "5km"}
                    onPress={() => handleFilterChange("distance", "5km")}
                  />
                  <FilterOption
                    label="5-10km"
                    selected={filters.distance === "10km"}
                    onPress={() => handleFilterChange("distance", "10km")}
                  />
                  <FilterOption
                    label="10-20km"
                    selected={filters.distance === "20km"}
                    onPress={() => handleFilterChange("distance", "20km")}
                  />
                </View>
              </View>

              {/* Age Range Filter */}
              <View className="mb-6">
                <Text className="text-sm font-pmedium text-gray-600 mb-3">
                  Age Range
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <FilterOption
                    label="18-25"
                    selected={filters.ageRange === "18-25"}
                    onPress={() => handleFilterChange("ageRange", "18-25")}
                  />
                  <FilterOption
                    label="26-35"
                    selected={filters.ageRange === "26-35"}
                    onPress={() => handleFilterChange("ageRange", "26-35")}
                  />
                  <FilterOption
                    label="36+"
                    selected={filters.ageRange === "36+"}
                    onPress={() => handleFilterChange("ageRange", "36+")}
                  />
                </View>
              </View>

              {/* Interests Filter */}
              <View className="mb-6">
                <Text className="text-sm font-pmedium text-gray-600 mb-3">
                  Interests
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <InterestTag label="Photography" />
                  <InterestTag label="Hiking" />
                  <InterestTag label="Food" />
                  <InterestTag label="Art" />
                  <InterestTag label="Music" />
                  <InterestTag label="Sports" />
                  <InterestTag label="Travel" />
                  <InterestTag label="Reading" />
                </View>
              </View>

              {/* Profession Filter */}
              <View className="mb-6">
                <Text className="text-sm font-pmedium text-gray-600 mb-3">
                  Profession
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <FilterOption
                    label="Student"
                    selected={filters.profession === "student"}
                    onPress={() => handleFilterChange("profession", "student")}
                  />
                  <FilterOption
                    label="Professional"
                    selected={filters.profession === "professional"}
                    onPress={() =>
                      handleFilterChange("profession", "professional")
                    }
                  />
                  <FilterOption
                    label="Other"
                    selected={filters.profession === "other"}
                    onPress={() => handleFilterChange("profession", "other")}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Apply Button */}
            <View className="mt-6 space-y-3">
              <TouchableOpacity
                className="bg-violet-600 py-3.5 rounded-xl"
                onPress={() => setShowFilters(false)}
              >
                <Text className="text-white font-pbold text-center">
                  Apply Filters
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3"
                onPress={() => setShowFilters(false)}
              >
                <Text className="text-gray-600 font-pmedium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Trips List */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Text className="text-lg font-psemibold text-gray-800 mb-4">
            Available Trips
          </Text>
          {discoverTrips && discoverTrips.length > 0 ? (
            discoverTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onView={() => handleViewTrip(trip)}
                isUserTrip={false}
              />
            ))
          ) : (
            <View className="py-8 items-center">
              <Text className="text-gray-500 font-pmedium text-center">
                No trips available at the moment
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const FilterTag = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-xl mr-2 ${
      active ? "bg-violet-600" : "bg-gray-50"
    }`}
  >
    <Text className={`font-pmedium ${active ? "text-white" : "text-gray-600"}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

const FilterOption = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-xl ${
      selected ? "bg-violet-600" : "bg-gray-50"
    }`}
  >
    <Text
      className={`font-pmedium ${selected ? "text-white" : "text-gray-600"}`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const InterestTag = ({ label }) => (
  <TouchableOpacity className="px-3 py-1.5 bg-violet-100 rounded-lg">
    <Text className="font-pmedium text-violet-600 text-sm">{label}</Text>
  </TouchableOpacity>
);

export default Trips;
