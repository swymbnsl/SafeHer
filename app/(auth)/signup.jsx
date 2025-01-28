import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await AsyncStorage.setItem("userToken", "dummy-token");
      router.replace("/(tabs)");
    } catch (error) {
      setError("Sign up failed. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Top Section */}
        <View className="absolute top-0 w-full h-72 bg-violet-600 rounded-b-[50px]">
          <TouchableOpacity
            className="absolute top-4 left-4 p-2"
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1 justify-center items-center">
            {/* Logo Circle */}
            <View className="w-20 h-20 rounded-full bg-white/30 mb-3 items-center justify-center">
              {/* Add your logo here */}
            </View>
            <Text className="text-3xl font-pbold text-white">
              Create Account
            </Text>
            <Text className="text-white/80 mt-2 font-plight">
              Sign up to get started
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 px-6"
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingTop: 260 }}
          >
            <View className="bg-white rounded-3xl -mt-10 p-6 shadow-lg shadow-black/5">
              {error ? (
                <Text className="text-red-500 mb-4 font-pmedium text-center">
                  {error}
                </Text>
              ) : null}

              <CustomInput
                additionalStyle="mt-8"
                label="Full Name"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Enter your full name"
              />

              <CustomInput
                label="Email Address"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="Enter your email"
                keyboardType="email-address"
              />

              <CustomInput
                label="Password"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                placeholder="Create a password"
                secureTextEntry
              />

              <CustomInput
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                placeholder="Confirm your password"
                secureTextEntry
              />

              <CustomButton
                title="Sign Up"
                onPress={handleSignUp}
                className="mt-2"
              />
            </View>

            {/* Login link */}
            <View className="flex-row justify-center mt-6 mb-6">
              <Text className="text-gray-600 font-pregular">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/login")}
                accessibilityRole="button"
                accessibilityLabel="Go to login"
              >
                <Text className="text-violet-600 font-psemibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
