import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import Toast from "@/components/Toast";
import { useUserContext } from "@/context/userContextProvider";

const EditProfile = () => {
  const router = useRouter();
  const { user, fetchUser } = useUserContext();
  const [profileData, setProfileData] = useState({
    name: "",
    avatar: "",
    email: "",
    phone: "",
    description: "",
    location: "",
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        avatar: user.avatar || "",
        email: user.email || "",
        phone: user.phone_number || "",
        description: user.description || "",
        location: user.location || "",
      });
    }
  }, [user]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant permission to access your photos"
      );
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const newAvatar = {
          base64: result.assets[0].base64,
          uri: result.assets[0].uri,
        };

        // Upload image and get public URL
        const publicUrl = await supabase.uploadAvatarImage(newAvatar);

        // Update local state
        setProfileData((prev) => ({
          ...prev,
          avatar: publicUrl,
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile picture");
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileData.name.trim() || !profileData.email.trim()) {
      Alert.alert("Error", "Name and email are required");
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: profileData.name,
          email: profileData.email,
          phone_number: profileData.phone,
          description: profileData.description,
          location: profileData.location,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchUser(); // Refresh user context
      setToastMessage("Profile updated successfully!");
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        router.replace("/(tabs)/profile");
      }, 1500);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-14 pb-4 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-gray-50 p-2 rounded-xl"
            >
              <Ionicons name="arrow-back" size={24} color="#4a3b6b" />
            </TouchableOpacity>
            <Text className="text-xl font-pbold text-gray-900">
              Edit Profile
            </Text>
          </View>
        </View>

        <View className="p-6">
          {/* Profile Image */}
          <TouchableOpacity onPress={pickImage} className="items-center mb-8">
            <View className="relative">
              <Image
                source={{
                  uri: profileData.avatar || "https://via.placeholder.com/150",
                }}
                className="w-24 h-24 rounded-full bg-gray-100"
              />
              <View className="absolute bottom-0 right-0 bg-violet-600 p-2 rounded-full shadow-sm">
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Form Fields */}
          <View className="space-y-6">
            {/* Name Input */}
            <View>
              <Text className="text-gray-700 font-pmedium mb-2">Name</Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-4 text-gray-800 font-pmedium"
                value={profileData.name}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, name: text }))
                }
                placeholder="Enter your name"
              />
            </View>

            {/* Email Input */}
            <View>
              <Text className="text-gray-700 font-pmedium mb-2">Email</Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-4 text-gray-800 font-pmedium"
                value={profileData.email}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
                placeholder="Enter your email"
              />
            </View>

            {/* Phone Input */}
            <View>
              <Text className="text-gray-700 font-pmedium mb-2">Phone</Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-4 text-gray-800 font-pmedium"
                value={profileData.phone}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, phone: text }))
                }
                keyboardType="phone-pad"
                placeholder="Enter your phone number"
              />
            </View>

            {/* Description Input */}
            <View>
              <Text className="text-gray-700 font-pmedium mb-2">
                Description
              </Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-4 text-gray-800 font-pmedium min-h-[120]"
                value={profileData.description}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, description: text }))
                }
                multiline
                numberOfLines={4}
                placeholder="Tell us about yourself"
              />
            </View>

            {/* Location Input */}
            <View>
              <Text className="text-gray-700 font-pmedium mb-2">Location</Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-4 text-gray-800 font-pmedium"
                value={profileData.location}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, location: text }))
                }
                placeholder="Enter your location"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className="bg-violet-600 rounded-xl py-4 mt-8 mb-6"
            onPress={handleUpdateProfile}
          >
            <Text className="text-white font-pbold text-center text-lg">
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toast */}
      {showToast && (
        <Toast message={toastMessage} onHide={() => setShowToast(false)} />
      )}
    </View>
  );
};

export default EditProfile;
