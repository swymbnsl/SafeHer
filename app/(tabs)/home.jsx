import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colours';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Rahul accepted your friend request",
      time: "2 hours ago",
      read: false
    },
    {
      id: 2,
      message: "New trip request from Priya",
      time: "5 hours ago",
      read: false
    },
    {
      id: 3,
      message: "Your trip was successfully posted",
      time: "1 day ago",
      read: true
    }
  ]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (hasUnread) {
      setHasUnread(false);
      markAllAsRead();
    }
  };

  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      read: true
    }));
    setNotifications(updatedNotifications);
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.log('Error saving notifications:', error);
    }
  };

  return (
    <View className="flex-1 bg-[#fff4ff]">
      {/* Branding Header */}
      <View className="bg-white pt-14 pb-4 rounded-b-3xl shadow-sm">
        <View className="flex-row justify-between items-center px-6">
          <View>
            <Text className="text-3xl font-pbold text-[#9f86ff]">SafeHer</Text>
            <Text className="text-sm font-pmedium text-[#6f5c91]">Your Safety Companion</Text>
          </View>
          <TouchableOpacity 
            className="bg-[#f0e6ff] p-2 rounded-full"
            onPress={toggleNotifications}
          >
            <Ionicons 
              name={showNotifications || !hasUnread ? "notifications" : "notifications-outline"} 
              size={24} 
              color="#9f86ff" 
            />
            {hasUnread && (
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="flex-row justify-between my-4">
          <StatsCard number="12" label="Trips" />
          <StatsCard number="28" label="Friends" />
          <StatsCard number="4.9" label="Rating" />
        </View>

        <View className="flex-row items-center bg-white rounded-xl p-3 mb-6 shadow-md border border-[#f0e6ff]">
          <Ionicons name="search" size={20} color="#9f86ff" />
          <TextInput
            className="flex-1 ml-3 text-[#4a3b6b] font-pmedium"
            placeholder="Search trips or companions"
            placeholderTextColor="#6f5c91"
          />
          <TouchableOpacity className="bg-[#f0e6ff] p-2 rounded-lg">
            <Ionicons name="filter" size={20} color="#9f86ff" />
          </TouchableOpacity>
        </View>

        <Text className="text-xl font-pbold text-[#4a3b6b] mb-4">My Posted Trips</Text>
        <TripCard
          name="Qutub Minar Evening Visit"
          date="25th October 2023"
          time="4:00 PM"
          companions={2}
        />
        <TripCard
          name="Hauz Khas Village"
          date="30th October 2023"
          time="6:00 PM"
          companions={3}
        />

        <Text className="text-xl font-pbold text-[#4a3b6b] mb-4 mt-2">Travel Requests</Text>
        <RequestCard
          name="Priya Sharma"
          request="Looking for a companion to visit Qutub Minar this Saturday evening for photography."
        />
        <RequestCard
          name="Anjali Mehta"
          request="The Lodhi Garden walk sounds great for Sunday!"
        />
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

const StatsCard = ({ number, label }) => (
  <View className="bg-white p-4 rounded-xl shadow-sm border border-[#f0e6ff] w-[30%]">
    <Text className="text-xl font-pbold text-[#4a3b6b] text-center">{number}</Text>
    <Text className="text-[#6f5c91] font-pmedium text-center text-sm">{label}</Text>
  </View>
);

const TripCard = ({ name, date, time, companions }) => (
  <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg border border-[#f0e6ff]">
    <Text className="text-lg font-psemibold text-[#4a3b6b]">{name}</Text>
    <Text className="text-[#6f5c91] font-pmedium mt-1">{date}, {time}</Text>
    <Text className="text-[#6f5c91] font-pmedium mt-1">{companions} companions</Text>
    <View className="flex-row mt-4">
      <TouchableOpacity className="bg-[#6f5c91] rounded-xl px-5 py-2.5 mr-3">
        <Text className="text-white font-pmedium">Edit Trip</Text>
      </TouchableOpacity>
      <TouchableOpacity className="border-2 border-[#d4a6ff] rounded-xl px-5 py-2.5">
        <Text className="text-[#9f86ff] font-pmedium">Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const RequestCard = ({ name, request }) => (
  <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg border border-[#f0e6ff]">
    <Text className="text-lg font-psemibold text-[#4a3b6b]">{name}</Text>
    <Text className="text-[#6f5c91] font-pmedium mt-1">{request}</Text>
    <View className="flex-row mt-4">
      <TouchableOpacity className="bg-[#9f86ff] rounded-xl px-5 py-2.5 mr-3">
        <Text className="text-white font-pmedium">Accept Request</Text>
      </TouchableOpacity>
      <TouchableOpacity className="border-2 border-[#9f86ff] rounded-xl px-5 py-2.5">
        <Text className="text-[#9f86ff] font-pmedium">Message</Text>
      </TouchableOpacity>
    </View>
  </View>
);
export default Home;

