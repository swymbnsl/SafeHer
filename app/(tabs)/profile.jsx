import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "@/lib/supabase";
const StatCard = ({ icon, label, value }) => (
  <View
    className="bg-white p-4 rounded-2xl flex-1 mx-1.5"
    style={{
      shadowColor: "#7C3AED",
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    }}
  >
    <View className="bg-violet-100 p-2 rounded-xl w-10 h-10 items-center justify-center mb-2">
      <Ionicons name={icon} size={20} color="#7C3AED" />
    </View>
    <Text className="text-2xl font-pbold text-gray-800">{value}</Text>
    <Text className="text-gray-500 font-pmedium">{label}</Text>
  </View>
);

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "John Doe",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    email: "john.doe@example.com",
    phone: "+91 98765 43210",
    description: "Travel enthusiast | Food lover | Adventure seeker",
    location: "Delhi",
    totalTrips: 12,
    friends: 45,
    recentTrips: [
      {
        name: "Delhi Music Festival",
        date: "15th October 2023",
        status: "completed",
      },
      {
        name: "Qutub Minar Visit",
        date: "25th October 2023",
        status: "upcoming",
      },
    ],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [blinkOpacity] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const animateRefresh = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(blinkOpacity, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(blinkOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotateAnim.setValue(0);
    });
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    animateRefresh();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await loadProfile();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem("userProfile");
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile((prev) => ({
          ...prev,
          ...parsedProfile,
        }));
      }
    } catch (error) {
      console.log("Error loading profile:", error);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to upload images.");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // Compress the image
        const manipulatedImage = await manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 500 } }],
          { compress: 0.7, format: SaveFormat.JPEG }
        );

        // Update profile avatar
        setProfile((prev) => ({
          ...prev,
          avatar: manipulatedImage.uri,
        }));

        // Here you would typically upload the image to your server
        // For now, we'll just save it locally
        try {
          await AsyncStorage.setItem("profileAvatar", manipulatedImage.uri);
        } catch (error) {
          console.log("Error saving avatar:", error);
        }
      }
    } catch (error) {
      console.log("Error picking image:", error);
      alert("There was an error picking the image. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-white px-6 pt-2 pb-6 rounded-b-3xl shadow-sm">
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              onPress={onRefresh}
              className="bg-violet-100 p-2 rounded-full"
              disabled={refreshing}
            >
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons name="refresh" size={20} color="#7C3AED" />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/edit_profile")}
              className="bg-violet-100 p-2 rounded-full"
            >
              <Ionicons name="pencil" size={20} color="#7C3AED" />
            </TouchableOpacity>
          </View>

          <View className="items-center">
            <TouchableOpacity onPress={pickImage} className="relative">
              <Image
                source={{ uri: profile.avatar }}
                className="w-24 h-24 rounded-full"
              />
              <View className="absolute bottom-0 right-0 bg-violet-600 p-2 rounded-full">
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <Text className="text-2xl font-pbold text-gray-900 mt-4">
              {profile.name}
            </Text>
            <Text className="text-gray-500 font-pmedium">{profile.email}</Text>
          </View>
        </View>

        <View className="px-6">
          {/* Stats */}
          <View className="flex-row mt-6">
            <StatCard icon="map" label="Trips" value={profile.totalTrips} />
            <StatCard icon="people" label="Friends" value={profile.friends} />
          </View>

          {/* Personal Info */}
          <Text className="text-lg font-psemibold text-gray-800 mb-4 mt-6">
            Personal Info
          </Text>
          <View
            className="bg-white p-4 rounded-2xl mb-6"
            style={{
              shadowColor: "#7C3AED",
              shadowOpacity: 0.1,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-violet-100 p-2 rounded-xl mr-3">
                <Ionicons name="call-outline" size={20} color="#7C3AED" />
              </View>
              <Text className="text-gray-700 font-pmedium">
                {profile.phone}
              </Text>
            </View>
            <View className="flex-row items-center mb-4">
              <View className="bg-violet-100 p-2 rounded-xl mr-3">
                <Ionicons name="mail-outline" size={20} color="#7C3AED" />
              </View>
              <Text className="text-gray-700 font-pmedium">
                {profile.email}
              </Text>
            </View>
            <View className="flex-row items-center mb-4">
              <View className="bg-violet-100 p-2 rounded-xl mr-3">
                <Ionicons name="location-outline" size={20} color="#7C3AED" />
              </View>
              <Text className="text-gray-700 font-pmedium">
                {profile.location}
              </Text>
            </View>
            <View className="flex-row items-start">
              <View className="bg-violet-100 p-2 rounded-xl mr-3">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#7C3AED"
                />
              </View>
              <Text className="text-gray-700 font-pmedium flex-1">
                {profile.description}
              </Text>
            </View>
          </View>

          {/* Recent Trips */}
          <Text className="text-lg font-psemibold text-gray-800 mb-4">
            Recent Trips
          </Text>
          {profile.recentTrips.map((trip, index) => (
            <View
              key={index}
              className="bg-white p-4 rounded-2xl mb-4"
              style={{
                shadowColor: "#7C3AED",
                shadowOpacity: 0.1,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <Text className="text-gray-800 font-pbold">{trip.name}</Text>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-500 font-pmedium">{trip.date}</Text>
                <View
                  className={`px-3 py-1 rounded-full ${
                    trip.status === "completed"
                      ? "bg-green-100"
                      : "bg-violet-100"
                  }`}
                >
                  <Text
                    className={`font-pmedium ${
                      trip.status === "completed"
                        ? "text-green-600"
                        : "text-violet-600"
                    }`}
                  >
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View className="px-6 pb-20">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-violet-600 py-4 px-6 rounded-2xl flex-row items-center justify-center"
            accessibilityLabel="Logout"
            accessibilityRole="button"
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color="white"
              className="mr-2"
            />
            <Text className="text-white font-pbold text-lg ml-2">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
