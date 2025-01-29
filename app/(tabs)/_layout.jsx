import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity } from "react-native";
import { Animated } from "react-native";
import { useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/userContextProvider";

export default function TabLayout() {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const { user, isLoading, fetchUser } = useUserContext();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, user]);

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

  if (isLoading || !user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: 70,
          backgroundColor: "white",
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#7C3AED",
          shadowOpacity: 0.1,
          shadowRadius: 15,
          shadowOffset: {
            width: 0,
            height: -3,
          },
          paddingBottom: Platform.OS === "ios" ? 20 : 12,
          paddingTop: 12,
        },
        tabBarItemStyle: {
          height: "100%",
          paddingTop: 0,
        },
        tabBarIconStyle: {
          marginBottom: 4,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#7C3AED",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontFamily: "Poppins-Medium",
          fontSize: 12,
          marginTop: -4,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
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
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Trips",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "map" : "map-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubble" : "chatbubble-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden screens */}
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
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
