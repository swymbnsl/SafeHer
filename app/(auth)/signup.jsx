import React, { useState, useEffect } from "react";
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
import { useUserContext } from "@/context/userContextProvider";
import CustomInput from "../../components/CustomInput";
import {
  emailSignUp,
  getLoggedInUser,
  getUserFromDB,
  supabase,
} from "@/lib/supabase";

export default function SignUp() {
  const router = useRouter();
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errorText, setErrorText] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabledSignupButton, setIsDisabledSignupButton] = useState(true);

  const { fetchUser, isLoading: isLoadingUser, user } = useUserContext();

  const handleSignUp = async () => {
    try {
      setErrorText({
        name: "",
        email: "",
        password: "",
      });
      setIsLoading(true);

      const res = await emailSignUp(inputs.email, inputs.password, inputs.name);
      console.log("User created successfully", res);
      await fetchUser();
      // showSuccessToast(
      //   "Account created successfully",
      //   "Redirecting to home..."
      // );
      // router.replace("/home");
    } catch (error) {
      // if (error.cause) {
      //   // const errorMessage = getCustomErrorMessage(
      //   //   error.cause.code,
      //   //   error.cause.type,
      //   //   error.cause.message
      //   // );
      //   const errorMessage = error.cause.message;
      //   showErrorToast("Error Creating Account", errorMessage);
      //   console.log(error.cause);
      // } else if (error instanceof ZodError) {
      //   setErrorText((prev) => {
      //     return {
      //       ...prev,
      //       [error.issues[0].path[0]]: error.issues[0].message,
      //     };
      //   });
      // } else {
      //   showErrorToast(
      //     "Error Creating Account",
      //     "See console for more details"
      //   );
      console.log(error.cause);
      // }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isLoadingUser && user) {
      router.replace("/home");
    }
  }, [isLoadingUser, user]);

  useEffect(() => {
    if (
      inputs.name.length > 0 &&
      inputs.email.length > 0 &&
      inputs.password.length > 0
    ) {
      setIsDisabledSignupButton(false);
    } else {
      setIsDisabledSignupButton(true);
    }
  }, [inputs]);

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
              <CustomInput
                additionalStyle="mt-8"
                label="Full Name"
                value={inputs.name}
                onChangeText={(text) => setInputs({ ...inputs, name: text })}
                placeholder="Enter your full name"
              />

              <CustomInput
                label="Email Address"
                value={inputs.email}
                onChangeText={(text) => setInputs({ ...inputs, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
              />

              <CustomInput
                label="Password"
                value={inputs.password}
                onChangeText={(text) =>
                  setInputs({ ...inputs, password: text })
                }
                placeholder="Create a password"
                secureTextEntry
              />

              <CustomInput
                label="Confirm Password"
                value={inputs.confirmPassword}
                onChangeText={(text) =>
                  setInputs({ ...inputs, confirmPassword: text })
                }
                placeholder="Confirm your password"
                secureTextEntry
              />

              <CustomButton
                title="Sign Up"
                onPress={handleSignUp}
                className="mt-2"
                textClassName="text-white"
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
