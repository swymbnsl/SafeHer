import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "@/components/CustomButton";
import { signOut } from "../lib/supabase";

const PendingVerification = () => {
  const router = useRouter();

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
          <View className="w-20 h-20 rounded-full overflow-hidden border-2 border-white bg-violet-100 mb-6 items-center justify-center">
            <Image
              source={require("../assets/images/logo.png")}
              resizeMode="contain"
              className="w-full h-full"
            />
          </View>
          <Text className="text-3xl font-pbold text-white">
            Verification Pending
          </Text>
          <Text className="text-white/80 mt-2 font-plight text-center px-6">
            Your documents are under review
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View className="flex-1 px-6">
        <View className="bg-white -mt-10 rounded-3xl p-6 shadow-lg shadow-black/5">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-violet-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="time-outline" size={32} color="#7C3AED" />
            </View>
            <Text className="text-xl font-pbold text-gray-800 mb-2">
              Under Review
            </Text>
            <Text className="text-gray-600 text-center font-pregular">
              We are reviewing your verification documents. This process usually
              takes up to 24 hours.
            </Text>
          </View>

          {/* Status Timeline */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-violet-100 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={20} color="#7C3AED" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-pmedium text-gray-800">
                  Documents Submitted
                </Text>
                <Text className="text-sm text-gray-500">
                  Your documents have been received
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-violet-100 rounded-full items-center justify-center">
                <Ionicons name="refresh" size={20} color="#7C3AED" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-pmedium text-gray-800">Under Review</Text>
                <Text className="text-sm text-gray-500">
                  Our team is reviewing your documents
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name="checkmark-circle" size={20} color="#9CA3AF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-pmedium text-gray-400">
                  Verification Complete
                </Text>
                <Text className="text-sm text-gray-400">
                  You'll be notified once verified
                </Text>
              </View>
            </View>
          </View>

          <CustomButton
            title="Sign Out"
            onPress={async () => {
              await signOut();
              router.replace("/");
            }}
            textClassName="text-white"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PendingVerification;
