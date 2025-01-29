import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatPreview = ({ chat, onPress }) => (
  <TouchableOpacity
    className="bg-white p-4 rounded-2xl mb-4"
    style={{
      shadowColor: "#7C3AED",
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    }}
    onPress={onPress}
  >
    <View className="flex-row items-center">
      <View className="relative">
        <Image
          source={{ uri: chat.avatar }}
          className="w-12 h-12 rounded-full"
        />
        {chat.isOnline && (
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-800 font-psemibold text-base">
            {chat.name}
          </Text>
          <Text className="text-gray-500 font-plight text-sm">{chat.time}</Text>
        </View>
        <View className="flex-row justify-between items-center mt-1">
          <Text
            className="text-gray-500 font-plight flex-1 mr-4"
            numberOfLines={1}
          >
            {chat.lastMessage}
          </Text>
          {chat.unreadCount > 0 && (
            <View className="bg-violet-600 rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
              <Text className="text-white text-xs font-pbold">
                {chat.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const Chats = () => {
  const router = useRouter();
  const chats = [
    {
      id: "1",
      name: "Priya Sharma",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      lastMessage: "Sure, lets meet at the mall entrance",
      time: "2m ago",
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: "2",
      name: "Rahul Verma",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      lastMessage: "The trip was amazing!",
      time: "1h ago",
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: "3",
      name: "Anjali Gupta",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      lastMessage: "See you tomorrow at the event",
      time: "3h ago",
      unreadCount: 1,
      isOnline: true,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-2 pb-4 bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-pbold text-gray-900">Messages</Text>
          <TouchableOpacity className="relative">
            <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
              <Ionicons name="create-outline" size={22} color="#7C3AED" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="mt-4 flex-row items-center bg-gray-50 rounded-xl p-3">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-700 font-pmedium"
            placeholder="Search messages"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4">
          {chats.map((chat) => (
            <ChatPreview
              key={chat.id}
              chat={chat}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/chat",
                  params: { name: chat.name, id: chat.id },
                })
              }
            />
          ))}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Chats;
