import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      await AsyncStorage.setItem("userToken", "dummy-token");
      router.replace("/(tabs)");
    } catch (error) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Section */}
      <View className="h-72 w-full bg-violet-600 rounded-b-[50px]">
        <TouchableOpacity
          className="absolute top-4 left-4 z-10 p-2"
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
          <Text className="text-3xl font-pbold text-white">Welcome Back</Text>
          <Text className="text-white/80 mt-2 font-plight">
            Sign in to continue
          </Text>
        </View>
      </View>

      {/* Form Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-6"
      >
        <View className="bg-white -mt-10 rounded-3xl p-6 shadow-lg shadow-black/5">
          {error ? (
            <Text className="text-red-500 mb-4 font-pmedium text-center">
              {error}
            </Text>
          ) : null}

          <CustomInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
          />

          <CustomInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            className="mt-2"
          />
        </View>

        {/* Sign up link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600 font-pregular">New to the app? </Text>
          <TouchableOpacity
            onPress={() => router.push("/signup")}
            accessibilityRole="button"
            accessibilityLabel="Sign up button"
          >
            <Text className="text-violet-600 font-psemibold">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
