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
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "@/lib/supabase";
import {
  getUserFromDb,
  getUserTrips,
  getFriends,
  getUserTripCount,
} from "@/lib/supabase";
import ActiveTripCard from "@/components/ActiveTripCard";

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
    name: "",
    avatar: null,
    email: "",
    phone: "",
    description: "",
    location: "",
    totalTrips: 0,
    friends: 0,
    recentTrips: [],
    interests: [],
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
      const userData = await getUserFromDb();
      const userTrips = await getUserTrips();
      const userFriends = await getFriends();
      const tripCount = await getUserTripCount();
      console.log("userData", userData);
      // Get the first 5 trips
      const recentTrips = userTrips.slice(0, 5);

      setProfile({
        name: userData.name,
        avatar: userData.avatar,
        email: userData.email,
        phone: userData.phone_number || "Add your phone",
        totalTrips: tripCount,
        friends: userFriends.length,
        recentTrips,
        interests: userData.interests || [],
      });
    } catch (error) {
      console.log("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile data");
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
              onPress={() => router.push("/edit-profile")}
              className="bg-violet-100 p-2 rounded-full"
            >
              <Ionicons name="pencil" size={20} color="#7C3AED" />
            </TouchableOpacity>
          </View>

          <View className="items-center">
            <View className="relative">
              {profile.avatar ? (
                <Image
                  source={{ uri: profile.avatar }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-violet-100 items-center justify-center">
                  <Text
                    className="text-4xl font-pbold text-violet-600"
                    style={{ lineHeight: 45 }}
                  >
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
                  </Text>
                </View>
              )}
            </View>
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
            <View className="flex-row items-center">
              <View className="bg-violet-100 p-2 rounded-xl mr-3">
                <Ionicons name="mail-outline" size={20} color="#7C3AED" />
              </View>
              <Text className="text-gray-700 font-pmedium">
                {profile.email}
              </Text>
            </View>
          </View>

          {/* Add Interests section after Personal Info */}
          {profile.interests.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-psemibold text-gray-800 mb-4">
                Interests
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <View
                    key={interest}
                    className="bg-violet-100 px-4 py-2 rounded-full"
                  >
                    <Text className="text-violet-600 font-pbold">
                      {interest}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recent Trips Section */}
          <View className="px-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-psemibold text-gray-800">
                Recent Trips
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/my-trips")}
                className="flex-row items-center"
              >
                <Text className="text-violet-600 font-pmedium mr-1">
                  View all
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
              </TouchableOpacity>
            </View>

            {profile.recentTrips.length > 0 ? (
              profile.recentTrips.map((trip) => (
                <View key={trip.id} className="mb-4">
                  <ActiveTripCard
                    name={trip.name}
                    posterName={trip.users.name}
                    posterAvatar={trip.users.avatar}
                    posterInterests={trip.desired_interests}
                    start_time={trip.start_time}
                    end_time={trip.end_time}
                    distance={trip.distance}
                    companions={trip.max_companions}
                    image={trip.image}
                    coordinates={trip.location}
                    fullWidth={true}
                    hideActions={true}
                    onPress={() => router.push(`/trip/${trip.id}`)}
                  />
                </View>
              ))
            ) : (
              <View className="py-8 items-center">
                <Text className="text-gray-500 font-pmedium text-center">
                  You haven't created any trips yet
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-violet-600 px-6 py-3 rounded-xl"
                  onPress={() => router.push("/(tabs)/new-trip")}
                >
                  <Text className="text-white font-pmedium">Create a Trip</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
