import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';

const Message = ({ text, isSent, time }) => (
  <View className={`flex-row ${isSent ? 'justify-end' : 'justify-start'} mb-3`}>
    <View className={`${isSent ? 'bg-[#9f86ff]' : 'bg-white'} px-4 py-2 rounded-2xl max-w-[80%]`}>
      <Text className={`${isSent ? 'text-white' : 'text-[#4a3b6b]'} font-pmedium`}>{text}</Text>
      <Text className={`${isSent ? 'text-[#f0e6ff]' : 'text-[#6f5c91]'} text-xs mt-1`}>{time}</Text>
    </View>
  </View>
);

const Chat = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: "Hi! How are you?", isSent: false, time: "10:30 AM" },
    { text: "Hey! I'm good, thanks! How about you?", isSent: true, time: "10:31 AM" },
    { text: "I'm great! Are you interested in joining the trip to Qutub Minar?", isSent: false, time: "10:32 AM" },
    { text: "Yes, I'd love to! What time are you planning to go?", isSent: true, time: "10:33 AM" }
  ]);
  
  const scrollViewRef = useRef();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const navigation = useNavigation();

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        text: message,
        isSent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Mock reply after 1 second
      setTimeout(() => {
        const reply = {
          text: "That sounds great! Let's discuss the details.",
          isSent: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, reply]);
      }, 1000);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        navigation.setOptions({
          tabBarStyle: { display: 'none' }
        });
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        navigation.setOptions({
          tabBarStyle: {
            height: 65,
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#f0e6ff',
            paddingBottom: 10,
            paddingTop: 10,
          }
        });
      }
    );

    // Set initial navigation options
    navigation.setOptions({
      tabBarStyle: {
        height: 65,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f0e6ff',
        paddingBottom: 10,
        paddingTop: 10,
      }
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#fff4ff]"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-white">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="#4a3b6b" />
        </TouchableOpacity>
        <Text className="text-xl font-pbold text-[#4a3b6b]">{params.name}</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-6"
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => (
          <Message key={index} {...msg} />
        ))}
        <View className="h-4" />
      </ScrollView>

      <View className={`px-6 ${keyboardVisible ? 'pb-2' : 'pb-6'} pt-2 bg-white`}>
        <View className="flex-row items-center bg-[#fff4ff] rounded-xl p-2">
          <TextInput
            className="flex-1 ml-2 text-[#4a3b6b] font-pmedium"
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            placeholderTextColor="#6f5c91"
          />
          <TouchableOpacity 
            onPress={sendMessage}
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