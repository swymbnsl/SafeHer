import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  getOrCreateConversation,
  sendMessage,
  getMessages,
  supabase,
  getUserById,
} from "@/lib/supabase";
import { useUserContext } from "@/context/userContextProvider";

const Chat = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useUserContext();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const scrollViewRef = useRef();
  const subscriptionRef = useRef(null);
  console.log("params", params);
  useEffect(() => {
    initializeChat();
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      // Mark messages as read when leaving the chat
      if (conversationId) {
        markMessagesAsRead(conversationId);
      }
    };
  }, []);

  const markMessagesAsRead = async (convId) => {
    try {
      const { error } = await supabase.rpc("mark_messages_as_read", {
        p_conversation_id: convId,
        p_user_id: user.id,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const subscribeToMessages = (convId) => {
    subscriptionRef.current = supabase
      .channel(`messages:${convId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${convId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newMessage = payload.new;
            // Fetch sender details
            const { data: senderData } = await supabase
              .from("users")
              .select("name, avatar")
              .eq("user_id", newMessage.sender_id)
              .single();

            const messageWithSender = {
              ...newMessage,
              sender: senderData,
            };

            setMessages((current) => [...current, messageWithSender]);

            // Mark message as read if from other user
            if (newMessage.sender_id !== user.id) {
              await markMessagesAsRead(convId);
            }

            // Scroll to bottom
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }
      )
      .subscribe();
  };

  const initializeChat = async () => {
    try {
      let convId;
      let otherUserId;

      // If opened from chats screen, params.id is already a conversation_id
      if (params.type === "conversation") {
        convId = params.id;

        // Get conversation details to find the other user's ID
        const { data: conversation, error } = await supabase
          .from("conversations")
          .select("participants")
          .eq("id", convId)
          .single();

        if (error) throw error;

        // Find the other user's ID from participants
        otherUserId = conversation.participants.find((id) => id !== user.id);

        // Fetch other user's details
        const userDetails = await getUserById(otherUserId);
        setOtherUser(userDetails);
      } else {
        // If opened from friends screen, params.id is a user_id
        otherUserId = params.id;
        convId = await getOrCreateConversation(otherUserId);

        // Fetch other user's details
        const userDetails = await getUserById(otherUserId);
        setOtherUser(userDetails);
      }

      setConversationId(convId);

      // Load existing messages
      const existingMessages = await getMessages(convId);
      setMessages(existingMessages);

      // Mark messages as read
      await markMessagesAsRead(convId);

      // Subscribe to new messages
      subscribeToMessages(convId);

      // Scroll to bottom after messages load
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error("Chat initialization error:", error);
      setToastMessage("Failed to load chat");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId) return;

    try {
      const trimmedMessage = message.trim();
      setMessage(""); // Clear input immediately for better UX

      await sendMessage(conversationId, trimmedMessage);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Send message error:", error);
      // Optionally show error to user
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gray-50 p-2 rounded-xl mr-4"
          >
            <Ionicons name="chevron-back" size={24} color="#4a3b6b" />
          </TouchableOpacity>
          {otherUser && (
            <>
              {otherUser.avatar ? (
                <Image
                  source={{ uri: otherUser.avatar }}
                  className="w-10 h-10 rounded-full bg-gray-200"
                />
              ) : (
                <View className="w-10 h-10 rounded-full bg-violet-100 items-center justify-center">
                  <Text className="text-lg font-pbold text-violet-600">
                    {otherUser.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="ml-3 flex-1">
                <Text className="text-lg font-pbold text-gray-900">
                  {otherUser.name}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <>
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4"
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                className={`flex-row ${
                  msg.sender_id === user.id ? "justify-end" : "justify-start"
                } mb-3`}
              >
                {msg.sender_id !== user.id &&
                  (msg.sender?.avatar ? (
                    <Image
                      source={{ uri: msg.sender.avatar }}
                      className="w-8 h-8 rounded-full mr-2 mt-1"
                    />
                  ) : (
                    <View className="w-8 h-8 rounded-full bg-violet-100 mr-2 mt-1 items-center justify-center">
                      <Text className="text-sm font-pbold text-violet-600">
                        {msg.sender?.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  ))}
                <View
                  className={`${
                    msg.sender_id === user.id ? "bg-violet-600" : "bg-white"
                  } px-4 py-3 rounded-2xl max-w-[80%] shadow-sm`}
                  style={{
                    borderTopRightRadius: msg.sender_id === user.id ? 4 : 16,
                    borderTopLeftRadius: msg.sender_id === user.id ? 16 : 4,
                  }}
                >
                  <Text
                    className={`${
                      msg.sender_id === user.id ? "text-white" : "text-gray-800"
                    } font-pmedium`}
                  >
                    {msg.content}
                  </Text>
                  <Text
                    className={`${
                      msg.sender_id === user.id
                        ? "text-violet-200"
                        : "text-gray-500"
                    } text-xs mt-1`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            ))}
            <View className="h-4" />
          </ScrollView>

          {/* Message Input */}
          <View className="p-4 bg-white border-t border-gray-100">
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4">
              <TextInput
                className="flex-1 py-3 text-gray-800 font-pmedium"
                placeholder="Type a message..."
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
                placeholderTextColor="#9CA3AF"
                multiline
                maxHeight={100}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!message.trim()}
                className={`${
                  message.trim() ? "bg-violet-600" : "bg-gray-300"
                } p-2 rounded-xl ml-2`}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

export default Chat;
