import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity } from "react-native";
import { Animated } from "react-native";
import { useRef } from "react";

export default function TabLayout() {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fadeIn = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: 65,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#f0e6ff',
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarItemStyle: {
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarIconStyle: {
          marginBottom: 4,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#9f86ff',
        tabBarInactiveTintColor: '#6f5c91',
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 12,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
        animation: "fade",
        animationDuration: 200,
      }}
      screenListeners={{
        tabPress: () => {
          fadeIn();
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Trips",
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" size={22} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={22} color={color} />
          ),
        }}
      />
       <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble-outline" size={22} color={color} /> // Updated icon
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
     

      Hidden screens
      <Tabs.Screen
        name="edit_profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="new_trip"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit_trip"
        options={{
          href: null,
        }}
      />
      
    </Tabs>
  );
}