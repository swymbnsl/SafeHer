import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '../components/Toast';

const EditProfile = () => {
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    name: "",
    avatar: "",
    email: "",
    phone: "",
    description: "",
    location: "",
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadProfile();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
    }
  };

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData(parsedProfile);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const newAvatar = result.assets[0].uri;
        setProfileData(prev => ({
          ...prev,
          avatar: newAvatar,
          avatarUpdated: true,
          lastAvatarUpdate: new Date().toISOString()
        }));

        // Immediately save the avatar to ensure it persists
        const currentProfile = await AsyncStorage.getItem('userProfile');
        const parsedProfile = currentProfile ? JSON.parse(currentProfile) : {};
        await AsyncStorage.setItem('userProfile', JSON.stringify({
          ...parsedProfile,
          avatar: newAvatar,
          avatarUpdated: true,
          lastAvatarUpdate: new Date().toISOString()
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileData.name.trim() || !profileData.email.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    try {
      // Get the current stored profile
      const currentProfile = await AsyncStorage.getItem('userProfile');
      const parsedProfile = currentProfile ? JSON.parse(currentProfile) : {};

      // Merge the current profile with new data
      const updatedProfile = {
        ...parsedProfile,
        ...profileData,
        lastUpdated: new Date().toISOString()
      };

      // Save the merged profile
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      setToastMessage('Profile updated successfully!');
      setShowToast(true);
      
      setTimeout(() => {
        setShowToast(false);
        router.replace('/(tabs)/profile');
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <View className="flex-1 bg-[#fff4ff]">
      <ScrollView className="flex-1 px-6">
        <View className="flex-row items-center justify-between pt-14 pb-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="bg-white p-2 rounded-full shadow-sm"
          >
            <Ionicons name="arrow-back" size={24} color="#4a3b6b" />
          </TouchableOpacity>
          <Text className="text-2xl font-pbold text-[#4a3b6b]">Edit Profile</Text>
          <View className="w-10" />
        </View>

        <TouchableOpacity 
          onPress={pickImage}
          className="items-center mb-6"
        >
          <View className="relative">
            <Image
              source={{ uri: profileData.avatar || 'https://via.placeholder.com/150' }}
              className="w-24 h-24 rounded-full"
            />
            <View className="absolute bottom-0 right-0 bg-[#9f86ff] p-2 rounded-full">
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        <Text className="text-[#6f5c91] font-pmedium mb-2">Name</Text>
        <TextInput
          className="bg-white rounded-xl p-3 text-[#4a3b6b] font-pmedium mb-4 border border-[#f0e6ff]"
          value={profileData.name}
          onChangeText={(text) => setProfileData(prev => ({...prev, name: text}))}
        />

        <Text className="text-[#6f5c91] font-pmedium mb-2">Email</Text>
        <TextInput
          className="bg-white rounded-xl p-3 text-[#4a3b6b] font-pmedium mb-4 border border-[#f0e6ff]"
          value={profileData.email}
          onChangeText={(text) => setProfileData(prev => ({...prev, email: text}))}
          keyboardType="email-address"
        />

        <Text className="text-[#6f5c91] font-pmedium mb-2">Phone</Text>
        <TextInput
          className="bg-white rounded-xl p-3 text-[#4a3b6b] font-pmedium mb-4 border border-[#f0e6ff]"
          value={profileData.phone}
          onChangeText={(text) => setProfileData(prev => ({...prev, phone: text}))}
          keyboardType="phone-pad"
        />

        <Text className="text-[#6f5c91] font-pmedium mb-2">Description</Text>
        <TextInput
          className="bg-white rounded-xl p-3 text-[#4a3b6b] font-pmedium mb-4 border border-[#f0e6ff]"
          value={profileData.description}
          onChangeText={(text) => setProfileData(prev => ({...prev, description: text}))}
          multiline
          numberOfLines={3}
        />

        <Text className="text-[#6f5c91] font-pmedium mb-2">Location</Text>
        <TextInput
          className="bg-white rounded-xl p-3 text-[#4a3b6b] font-pmedium mb-6 border border-[#f0e6ff]"
          value={profileData.location}
          onChangeText={(text) => setProfileData(prev => ({...prev, location: text}))}
        />

        <TouchableOpacity 
          className="bg-[#9f86ff] rounded-xl py-4 items-center mb-6"
          onPress={handleUpdateProfile}
        >
          <Text className="text-white font-pbold text-lg">Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {showToast && (
        <Toast 
          message={toastMessage}
          type="success"
          onHide={() => setShowToast(false)}
        />
      )}
    </View>
  );
};

export default EditProfile; 