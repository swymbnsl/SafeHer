import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ChatPreview = ({ chat, onPress }) => (
  <TouchableOpacity 
    className="flex-row items-center bg-white p-4 rounded-2xl mb-4 shadow-sm border border-[#f0e6ff]"
    onPress={onPress}
  >
    <Image
      source={{ uri: chat.avatar }}
      className="w-12 h-12 rounded-full"
    />
    <View className="flex-1 ml-4">
      <View className="flex-row justify-between items-center">
        <Text className="text-[#4a3b6b] font-pbold text-lg">{chat.name}</Text>
        <Text className="text-[#6f5c91] text-sm">{chat.time}</Text>
      </View>
      <View className="flex-row justify-between items-center mt-1">
        <Text 
          className="text-[#6f5c91] font-pmedium flex-1 mr-4"
          numberOfLines={1}
        >
          {chat.lastMessage}
        </Text>
        {chat.unreadCount > 0 && (
          <View className="bg-[#9f86ff] rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white text-xs font-pbold">{chat.unreadCount}</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const Chats = () => {
  const router = useRouter();
  const chats = [
    {
      id: '1',
      name: 'Priya Sharma',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      lastMessage: 'Sure, lets meet at the mall entrance',
      time: '2m ago',
      unreadCount: 2
    },
    {
      id: '2',
      name: 'Rahul Verma',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      lastMessage: 'The trip was amazing!',
      time: '1h ago',
      unreadCount: 0
    },
    {
      id: '3',
      name: 'Anjali Gupta',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      lastMessage: 'See you tomorrow at the event',
      time: '3h ago',
      unreadCount: 1
    }
  ];

  return (
    <View className="flex-1 bg-[#fff4ff]">
      <View className="flex-row justify-between items-center px-6 pt-14 pb-4">
        <Text className="text-2xl font-pbold text-[#4a3b6b]">Messages</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {chats.map((chat) => (
          <ChatPreview 
            key={chat.id} 
            chat={chat}
            onPress={() => router.push({
              pathname: "/(tabs)/chat",
              params: { name: chat.name, id: chat.id }
            })}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default Chats; 