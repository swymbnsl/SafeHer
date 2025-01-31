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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  getOrCreateConversation,
  sendMessage,
  getMessages,
  supabase,
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
  const scrollViewRef = useRef();

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      const convId = await getOrCreateConversation(params.id);
      setConversationId(convId);

      // Load existing messages
      const existingMessages = await getMessages(convId);
      setMessages(existingMessages);

      // Subscribe to new messages
      const subscription = supabase
        .channel(`conversation:${convId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${convId}`,
          },
          (payload) => {
            setMessages((current) => [...current, payload.new]);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.log("Chat initialization error:", error.message);
      console.error("Chat initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId) return;

    try {
      await sendMessage(conversationId, message.trim());
      setMessage("");
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#9f86ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#fff4ff]"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#4a3b6b" />
        </TouchableOpacity>
        <Text className="text-xl font-pbold text-[#4a3b6b]">{params.name}</Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-6"
        onContentSizeChange={() =>
          scrollViewRef.current.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`flex-row ${
              msg.sender_id === user.id ? "justify-end" : "justify-start"
            } mb-3`}
          >
            <View
              className={`${
                msg.sender_id === user.id ? "bg-[#9f86ff]" : "bg-white"
              } px-4 py-2 rounded-2xl max-w-[80%]`}
            >
              <Text
                className={`${
                  msg.sender_id === user.id ? "text-white" : "text-[#4a3b6b]"
                } font-pmedium`}
              >
                {msg.content}
              </Text>
              <Text
                className={`${
                  msg.sender_id === user.id
                    ? "text-[#f0e6ff]"
                    : "text-[#6f5c91]"
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
      <View className="px-6 pb-6 pt-2 bg-white">
        <View className="flex-row items-center bg-[#fff4ff] rounded-xl p-2">
          <TextInput
            className="flex-1 ml-2 text-[#4a3b6b] font-pmedium"
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            placeholderTextColor="#6f5c91"
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            className="bg-[#9f86ff] p-2 rounded-xl"
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chat;
