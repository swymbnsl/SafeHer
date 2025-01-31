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
import { supabase, getFriends } from "@/lib/supabase";
import { useUserContext } from "@/context/userContextProvider";

const AvatarFallback = ({ name, size = 12 }) => (
  <View
    className={`w-${size} h-${size} rounded-full bg-violet-100 items-center justify-center`}
  >
    <Text className="text-violet-600 font-pmedium">
      {name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)}
    </Text>
  </View>
);

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
    onPress={() =>
      onPress({
        id: chat.id,
        type: "conversation",
      })
    }
  >
    <View className="flex-row items-center">
      <View className="relative">
        {chat.avatar ? (
          <Image
            source={{ uri: chat.avatar }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <AvatarFallback name={chat.name} />
        )}
        {chat.isOnline && (
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-800 font-psemibold text-base">
            {chat.name}
          </Text>
          <Text className="text-gray-500 font-plight text-sm">
            {chat.lastMessageTime}
          </Text>
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
  const { user } = useUserContext();
  const [conversations, setConversations] = React.useState([]);
  const [friends, setFriends] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadData();
    subscribeToMessages();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadConversations(), loadFriends()]);
    } catch (error) {
      console.log("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      const friendsData = await getFriends();
      setFriends(
        friendsData.map((friend) => ({
          id: friend.id,
          name: friend.name,
          avatar: friend.avatar,
        }))
      );
    } catch (error) {
      console.log("Error loading friends:", error);
    }
  };

  const loadConversations = async () => {
    try {
      const { data: conversationsData, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          messages:messages (
            content,
            created_at,
            sender_id,
            read_by
          )
        `
        )
        .contains("participants", [user.id])
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Get all unique participant IDs except current user
      const participantIds = [
        ...new Set(
          conversationsData.flatMap((conv) =>
            conv.participants.filter((id) => id !== user.id)
          )
        ),
      ];

      // Fetch user details for all participants
      const { data: participants } = await supabase
        .from("users")
        .select("user_id, name, avatar")
        .in("user_id", participantIds);

      console.log("Fetched participant details:", participants);

      // Format conversations with latest message and user details
      const formattedConversations = conversationsData.map((conv) => {
        const otherParticipant = participants?.find(
          (p) => conv.participants.includes(p.user_id) && p.user_id !== user.id
        );
        const latestMessage = conv.messages[conv.messages.length - 1];
        const unreadCount = conv.messages.filter(
          (msg) => msg.sender_id !== user.id && !msg.read_by.includes(user.id)
        ).length;

        const formattedConv = {
          id: conv.id,
          name: otherParticipant?.name || "Unknown",
          avatar: otherParticipant?.avatar || "https://via.placeholder.com/150",
          lastMessage: latestMessage?.content || "No messages yet",
          lastMessageTime: latestMessage
            ? new Date(latestMessage.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          unreadCount,
          isOnline: false, // Implement online status if needed
        };

        return formattedConv;
      });

      setConversations(formattedConversations);
    } catch (error) {
      console.log("Error loading conversations:", error);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          loadConversations(); // Reload conversations when messages change
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const FriendsList = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="pt-4 pb-2 ml-5"
    >
      {friends.map((friend) => (
        <TouchableOpacity
          key={friend.id}
          className="items-center mx-1 w-14"
          onPress={() =>
            router.push({
              pathname: "/(tabs)/chat",
              params: {
                name: friend.name,
                id: friend.id,
                type: "friend",
              },
            })
          }
        >
          <View className="relative">
            {friend.avatar ? (
              <Image
                source={{ uri: friend.avatar }}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <AvatarFallback name={friend.name} />
            )}
          </View>
          <Text
            numberOfLines={1}
            className="text-xs text-gray-600 mt-1 text-center"
          >
            {friend.name}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        className="items-center justify-center mx-3 w-14"
        onPress={() => router.push("/(tabs)/friends")}
      >
        <View className="w-12 h-12 rounded-full bg-violet-100 items-center justify-center">
          <Ionicons name="add" size={24} color="#7C3AED" />
        </View>
        <Text className="text-xs text-gray-600 mt-1 text-center">Add New</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const handleChatPress = (chatData) => {
    router.push({
      pathname: "/(tabs)/chat",
      params: {
        id: chatData.id,
        type: chatData.type,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-2 pb-4 bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-pbold text-gray-900">Messages</Text>
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
        <FriendsList />

        <View className="px-6 pt-4">
          {isLoading ? (
            <Text className="text-gray-500 text-center py-4">Loading...</Text>
          ) : conversations.length > 0 ? (
            conversations.map((conversation) => (
              <ChatPreview
                key={conversation.id}
                chat={conversation}
                onPress={handleChatPress}
              />
            ))
          ) : (
            <Text className="text-gray-500 text-center py-4">
              No conversations yet. Start chatting with your friends!
            </Text>
          )}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Chats;
