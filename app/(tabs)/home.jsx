import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Home = () => {
  const router = useRouter();
  const [hasUnread, setHasUnread] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-2 pb-4 bg-white">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-violet-100 mr-3">
              {/* Profile Image Placeholder */}
            </View>
            <View>
              <Text className="text-sm font-pmedium text-gray-500">
                Welcome back
              </Text>
              <Text className="text-lg font-pbold text-gray-900">
                Sarah Miller
              </Text>
            </View>
          </View>
          <TouchableOpacity className="relative">
            <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#7C3AED"
              />
              {hasUnread && (
                <View className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Featured Section */}
        <View className="px-6 py-4">
          <View className="bg-violet-600 p-5 rounded-2xl">
            <View className="flex-row items-center mb-3">
              <View className="bg-white/20 p-2 rounded-lg mr-3">
                <Ionicons name="shield-checkmark" size={24} color="white" />
              </View>
              <Text className="text-white font-pbold text-lg">
                Safety Score
              </Text>
            </View>
            <View className="py-1">
              <Text className="text-5xl font-pbold text-white leading-[56px]">
                4.9
              </Text>
            </View>
            <Text className="text-white/80 font-plight mb-4">
              Based on your last 12 trips
            </Text>
            <TouchableOpacity className="bg-white/20 py-2.5 rounded-xl">
              <Text className="text-white text-center font-pmedium">
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6">
          <Text className="text-lg font-psemibold text-gray-800 mb-3">
            Quick Actions
          </Text>
          <View className="flex-row justify-between">
            <QuickActionButton icon="add" label="New Trip" />
            <QuickActionButton icon="people" label="Find Buddy" />
            <QuickActionButton icon="map" label="Explore" />
          </View>
        </View>

        {/* Active Trips */}
        <View className="mt-6 px-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-psemibold text-gray-800">
              Active Trips
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-violet-600 font-pmedium mr-1">
                View All
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            <ActiveTripCard
              name="Qutub Minar"
              time="Today, 4:00 PM"
              companions={2}
            />
            <ActiveTripCard
              name="Hauz Khas"
              time="Tomorrow, 6:00 PM"
              companions={3}
            />
          </ScrollView>
        </View>

        {/* Recent Requests */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-psemibold text-gray-800 mb-4">
            Recent Requests
          </Text>
          <RequestCard
            name="Priya Sharma"
            location="Qutub Minar"
            time="2h ago"
            status="pending"
          />
          <RequestCard
            name="Anjali Mehta"
            location="Lodhi Garden"
            time="5h ago"
            status="accepted"
          />
        </View>

        {/* Add bottom padding */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

const QuickActionButton = ({ icon, label }) => (
  <TouchableOpacity
    className="items-center bg-white p-4 rounded-2xl shadow-md flex-1 mx-1"
    style={{
      shadowColor: "#7C3AED",
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 3,
    }}
  >
    <View className="bg-violet-100 p-2.5 rounded-xl mb-2">
      <Ionicons name={icon} size={22} color="#7C3AED" />
    </View>
    <Text className="font-pmedium text-gray-700 text-sm">{label}</Text>
  </TouchableOpacity>
);

const ActiveTripCard = ({ name, time, companions }) => (
  <TouchableOpacity
    className="bg-white p-4 rounded-2xl mr-4"
    style={{
      width: 200,
      shadowColor: "#7C3AED",
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 4,
    }}
  >
    <View className="flex-row items-center mb-3">
      <View className="w-10 h-10 bg-violet-100 rounded-xl items-center justify-center mr-3">
        <Ionicons name="location" size={20} color="#7C3AED" />
      </View>
      <Text className="text-lg font-psemibold text-gray-800">{name}</Text>
    </View>
    <Text className="text-gray-500 font-plight mb-3">{time}</Text>
    <View className="flex-row items-center">
      <View className="flex-row items-center">
        <Ionicons name="people" size={16} color="#6B7280" />
        <Text className="text-gray-500 font-plight ml-1">{companions}</Text>
      </View>
      <View className="flex-1 items-end">
        <View className="bg-violet-100 p-1.5 rounded-lg">
          <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const RequestCard = ({ name, location, time, status }) => (
  <View
    className="bg-white p-4 rounded-2xl mb-3"
    style={{
      shadowColor: "#7C3AED",
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 4,
    }}
  >
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-violet-100 rounded-full mr-3">
          {/* Profile Image */}
        </View>
        <View>
          <Text className="text-base font-psemibold text-gray-800">{name}</Text>
          <Text className="text-gray-500 font-plight text-sm">{location}</Text>
        </View>
      </View>
      <Text className="text-gray-400 font-plight text-sm">{time}</Text>
    </View>
    <View className="flex-row">
      <TouchableOpacity
        className={`flex-1 py-2.5 rounded-xl mr-2 ${
          status === "pending" ? "bg-violet-600" : "bg-gray-100"
        }`}
      >
        <Text
          className={`text-center font-pmedium ${
            status === "pending" ? "text-white" : "text-gray-600"
          }`}
        >
          {status === "pending" ? "Accept" : "Accepted"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 py-2.5 rounded-xl border border-violet-600">
        <Text className="text-violet-600 text-center font-pmedium">
          Message
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default Home;
