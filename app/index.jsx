import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import CustomButton from "../components/CustomButton";

const IntroScreen = () => {
  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleSignupClick = () => {
    router.push("/signup");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Main Content */}
      <View className="flex-1 justify-between px-6 pt-16 pb-8">
        {/* Top Section */}
        <View className="items-center">
          {/* Logo Circle */}
          <View className="w-32 h-32 rounded-full bg-violet-100 mb-6 items-center justify-center">
            {/* Add your logo here */}
            <View className="w-20 h-20 rounded-full bg-violet-200" />
          </View>
          <Text className="text-4xl font-pbold text-gray-900 mb-3">
            SafeHer
          </Text>
          <Text className="text-gray-600 text-lg font-pregular text-center leading-7">
            Your personal safety companion{"\n"}for every journey
          </Text>
        </View>

        {/* Bottom Section */}
        <View className="w-full flex gap-4">
          {/* Buttons */}
          <View className="flex gap-2">
            <CustomButton
              title="Sign In"
              onPress={handleLoginClick}
              className="bg-violet-600"
              textClassName="text-white font-psemibold"
            />

            <CustomButton
              title="Create Account"
              onPress={handleSignupClick}
              className="bg-white border-2 border-violet-600"
              textClassName="text-violet-600 font-psemibold"
            />
          </View>

          {/* Terms Text */}
          <Text className="text-gray-500 font-plight text-center text-sm leading-5">
            By continuing, you agree to our{"\n"}
            <Text className="font-pmedium text-violet-600">
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text className="font-pmedium text-violet-600">Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IntroScreen;
