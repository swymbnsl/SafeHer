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
import { updateProfile } from "@/lib/supabase";
import { useUserContext } from "@/context/userContextProvider";
import * as FileSystem from "expo-file-system";

const EditProfile = () => {
  const router = useRouter();
  const { user, fetchUser } = useUserContext();
  const initialProfileState = {
    name: "",
    avatar: null,
    email: "",
    phone: "",
    age: "",
    description: "",
    interests: [],
  };

  const [profileData, setProfileData] = useState(initialProfileState);
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        avatar: null,
        email: user.email || "",
        phone: user.phone || "",
        age: user.age || "",
        description: user.bio || "",
        interests: user.interests || [],
      });
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const img = result.assets[0];
        const base64 = await FileSystem.readAsStringAsync(img.uri, {
          encoding: "base64",
        });

        const filePath = `avatar-${user.id}-${Date.now()}.jpg`;
        const contentType = "image/jpeg";

        setProfileData((prev) => ({
          ...prev,
          avatar: {
            img: img.uri,
            base64,
            filePath,
            contentType,
          },
        }));
      }
    } catch (error) {
      console.log("error", error);
      Alert.alert("Error", "Failed to update profile picture");
    }
  };

  const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, "");
    // Remove +91 prefix if it exists
    const numberWithoutPrefix = digits.startsWith("91")
      ? digits.slice(2)
      : digits;
    return numberWithoutPrefix;
  };

  const handleUpdateProfile = async () => {
    // Validate age
    const ageNum = parseInt(profileData.age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      Alert.alert("Error", "Please enter a valid age between 13 and 120.");
      return;
    }

    // Validate phone number
    const phoneRegex = /^\d{10}$/;
    const formattedPhone = formatPhoneNumber(profileData.phone);
    if (!phoneRegex.test(formattedPhone)) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number.");
      return;
    }

    // Validate description
    if (profileData.description.trim().length < 10) {
      Alert.alert("Error", "Description must be at least 10 characters long.");
      return;
    }

    // Format phone number before submission
    const phoneWithPrefix = `+91${formattedPhone}`;

    try {
      await updateProfile({
        ...profileData,
        phone_number: phoneWithPrefix,
      });
      await fetchUser();

      setProfileData(initialProfileState);
      setInterestInput("");

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/profile"),
        },
      ]);
    } catch (error) {
      console.log("error", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleAddInterest = () => {
    if (interestInput.trim()) {
      const newInterest = interestInput.trim();
      if (!profileData.interests.includes(newInterest)) {
        setProfileData((prev) => ({
          ...prev,
          interests: [...prev.interests, newInterest],
        }));
      }
      setInterestInput("");
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.filter(
        (interest) => interest !== interestToRemove
      ),
    }));
  };

  if (!profileData) {
    return <Text>Loading...</Text>;
  }

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
            <Text className="text-xl text-left w-full ml-3 font-pbold text-gray-900">
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
                  uri: profileData?.avatar?.img || user?.avatar || undefined,
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
              <View className="flex-row items-center bg-gray-50 rounded-xl">
                <Text className="pl-4 text-gray-800 font-pmedium">+91</Text>
                <TextInput
                  className="flex-1 p-4 text-gray-800 font-pmedium"
                  value={formatPhoneNumber(profileData.phone)}
                  onChangeText={(text) =>
                    setProfileData((prev) => ({ ...prev, phone: text }))
                  }
                  keyboardType="phone-pad"
                  placeholder="Enter your phone number"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Age Input */}
            <View>
              <Text className="text-gray-700 font-pmedium mb-2">Age</Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-4 text-gray-800 font-pmedium"
                value={profileData.age}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, age: text }))
                }
                keyboardType="numeric"
                placeholder="Enter your age"
              />
            </View>

            {/* Description Input */}
            <View>
              <Text className="text-gray-700 font-pmedium mb-2">Bio</Text>
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

            {/* Interests Input */}
            <View>
              <Text className="text-gray-700 font-pmedium mb-2">Interests</Text>
              <View className="flex-row items-center space-x-2 mb-3">
                <TextInput
                  className="flex-1 bg-gray-50 rounded-xl p-4 text-gray-800 font-pmedium"
                  placeholder="Add an interest"
                  value={interestInput}
                  onChangeText={setInterestInput}
                  onSubmitEditing={handleAddInterest}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  onPress={handleAddInterest}
                  className="bg-violet-600 p-4 rounded-xl"
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {profileData.interests.map((interest) => (
                  <View
                    key={interest}
                    className="bg-violet-600 px-4 py-2 rounded-full flex-row items-center"
                  >
                    <Text className="text-white font-pbold mr-2">
                      {interest}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveInterest(interest)}
                      className="p-1"
                      accessibilityLabel={`Remove ${interest}`}
                    >
                      <Ionicons name="close-circle" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
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
    </View>
  );
};

export default EditProfile;
