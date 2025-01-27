import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, RefreshControl, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        status: "completed"
      },
      {
        name: "Qutub Minar Visit",
        date: "25th October 2023",
        status: "upcoming"
      }
    ]
  });
  const [refreshing, setRefreshing] = useState(false);
  const [blinkOpacity] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    await loadProfile();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(prev => ({
          ...prev,
          ...parsedProfile
        }));
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to upload images.');
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
        setProfile(prev => ({
          ...prev,
          avatar: manipulatedImage.uri
        }));

        // Here you would typically upload the image to your server
        // For now, we'll just save it locally
        try {
          await AsyncStorage.setItem('profileAvatar', manipulatedImage.uri);
        } catch (error) {
          console.log('Error saving avatar:', error);
        }
      }
    } catch (error) {
      console.log('Error picking image:', error);
      alert('There was an error picking the image. Please try again.');
    }
  };

  return (
    <Animated.View className="flex-1 bg-[#fff4ff]" style={{ opacity: blinkOpacity }}>
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="items-center pt-14 pb-6 bg-white rounded-b-3xl shadow-sm">
          <View className="w-full flex-row justify-between px-6 mb-4">
            <TouchableOpacity 
              onPress={onRefresh}
              className="bg-[#f0e6ff] p-2 rounded-full"
              disabled={refreshing}
            >
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons name="refresh" size={20} color="#9f86ff" />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/edit_profile')}
              className="bg-[#f0e6ff] p-2 rounded-full"
            >
              <Ionicons name="pencil" size={20} color="#9f86ff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            onPress={pickImage}
            className="relative"
          >
            <Image
              source={{ uri: profile.avatar }}
              className="w-24 h-24 rounded-full"
            />
            <View className="absolute bottom-0 right-0 bg-[#9f86ff] p-2 rounded-full">
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          
          <Text className="text-2xl font-pbold text-[#4a3b6b] mt-4">{profile.name}</Text>
          <Text className="text-[#6f5c91] font-pmedium">{profile.email}</Text>
        </View>

        <View className="flex-row justify-around py-6">
          <View className="items-center">
            <Text className="text-2xl font-pbold text-[#4a3b6b]">{profile.totalTrips}</Text>
            <Text className="text-[#6f5c91] font-pmedium">Trips</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-pbold text-[#4a3b6b]">{profile.friends}</Text>
            <Text className="text-[#6f5c91] font-pmedium">Friends</Text>
          </View>
        </View>

        <View className="px-6">
          <Text className="text-xl font-pbold text-[#4a3b6b] mb-4 mt-6">Personal Info</Text>
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-[#f0e6ff]">
            <View className="flex-row items-center mb-4">
              <Ionicons name="call-outline" size={20} color="#9f86ff" />
              <Text className="text-[#4a3b6b] font-pmedium ml-3">{profile.phone}</Text>
            </View>
            <View className="flex-row items-center mb-4">
              <Ionicons name="mail-outline" size={20} color="#9f86ff" />
              <Text className="text-[#4a3b6b] font-pmedium ml-3">{profile.email}</Text>
            </View>
            <View className="flex-row items-center mb-4">
              <Ionicons name="location-outline" size={20} color="#9f86ff" />
              <Text className="text-[#4a3b6b] font-pmedium ml-3">{profile.location}</Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="information-circle-outline" size={20} color="#9f86ff" />
              <Text className="text-[#4a3b6b] font-pmedium ml-3 flex-1">{profile.description}</Text>
            </View>
          </View>

          <Text className="text-xl font-pbold text-[#4a3b6b] mb-4">Recent Trips</Text>
          {profile.recentTrips.map((trip, index) => (
            <View 
              key={index} 
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#f0e6ff]"
            >
              <Text className="text-[#4a3b6b] font-pbold">{trip.name}</Text>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-[#6f5c91] font-pmedium">{trip.date}</Text>
                <View className={`px-3 py-1 rounded-full ${
                  trip.status === 'completed' ? 'bg-green-100' : 'bg-[#f0e6ff]'
                }`}>
                  <Text className={`font-pmedium ${
                    trip.status === 'completed' ? 'text-green-600' : 'text-[#9f86ff]'
                  }`}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View className="h-20" />
      </ScrollView>
    </Animated.View>
  );
};

export default Profile;
