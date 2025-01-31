import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "../lib/supabase";
import * as FileSystem from "expo-file-system";
import { useUserContext } from "@/context/userContextProvider";
import { submitVerification } from "@/lib/supabase";

const VerificationScreen = () => {
  const router = useRouter();
  const { user } = useUserContext();
  const [verificationMethod, setVerificationMethod] = useState(null);
  const [documents, setDocuments] = useState({
    aadhar: null,
    secondary: null, // PAN/DL/Passport
    selfie: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = async (type) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        setError("Permission to access media library is required");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const img = result.assets[0];

        try {
          // Read the image as base64
          const base64 = await FileSystem.readAsStringAsync(img.uri, {
            encoding: "base64",
          });

          // Generate a unique file path
          const filePath = `${
            user.id
          }/verification/${type}_${new Date().getTime()}.png`;
          const contentType = "image/png";

          setDocuments((prev) => ({
            ...prev,
            [type]: {
              img,
              base64,
              filePath,
              contentType,
            },
          }));

          await submitVerification({
            verificationMethod,
            ...documents,
          });
        } catch (error) {
          console.error("Error processing image:", error);
          setError("Failed to process image");
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setError("Failed to pick image");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await submitVerification({
        verificationMethod,
        ...documents,
      });

      Alert.alert(
        "Verification Submitted",
        "Your documents have been submitted successfully. We will verify your account within 24 hours and you will receive an email confirmation.",
        [
          {
            text: "OK",
            onPress: async () => {
              await signOut();
              router.replace("/");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert(
        "Error",
        "Failed to submit verification documents. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderDocumentOption = (type, title, subtitle) => (
    <TouchableOpacity
      onPress={() => pickImage(type)}
      className="bg-gray-50 rounded-xl p-4 mb-4 border-2 border-dashed border-gray-200"
    >
      {documents[type] ? (
        <Image
          source={{ uri: documents[type].img.uri }}
          className="w-full h-48 rounded-lg"
          resizeMode="cover"
        />
      ) : (
        <View className="h-48 items-center justify-center">
          <Ionicons name="cloud-upload-outline" size={48} color="#7C3AED" />
          <Text className="text-violet-600 font-pmedium mt-2">{title}</Text>
          <Text className="text-gray-500 text-sm text-center mt-1">
            {subtitle}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-2 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={async () => {
              try {
                await signOut();
                router.replace("/");
              } catch (error) {
                Alert.alert("Error", "Failed to logout. Please try again.");
              }
            }}
            className="bg-gray-50 p-2 rounded-xl"
          >
            <Ionicons name="close" size={24} color="#4a3b6b" />
          </TouchableOpacity>
          <Text className="text-xl w-full text-left ml-3 font-pbold text-gray-900">
            Verify Identity
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {!verificationMethod ? (
          <>
            <Text className="text-lg font-pbold text-gray-800 mb-4">
              Choose Verification Method
            </Text>

            <TouchableOpacity
              onPress={() => setVerificationMethod("documents")}
              className="bg-white rounded-xl p-6 mb-4 shadow-sm"
            >
              <View className="flex-row items-center">
                <View className="bg-violet-100 p-3 rounded-xl">
                  <Ionicons name="document-text" size={24} color="#7C3AED" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-gray-800 font-pbold text-lg">
                    Government IDs
                  </Text>
                  <Text className="text-gray-500">
                    Upload Aadhar and one more ID
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#7C3AED" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVerificationMethod("selfie")}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <View className="flex-row items-center">
                <View className="bg-violet-100 p-3 rounded-xl">
                  <Ionicons name="camera" size={24} color="#7C3AED" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-gray-800 font-pbold text-lg">
                    Selfie with Aadhar
                  </Text>
                  <Text className="text-gray-500">
                    Upload selfie holding Aadhar card
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#7C3AED" />
              </View>
            </TouchableOpacity>
          </>
        ) : verificationMethod === "documents" ? (
          <>
            <Text className="text-lg font-pbold text-gray-800 mb-4">
              Upload Government IDs
            </Text>

            {renderDocumentOption(
              "aadhar",
              "Upload Aadhar Card",
              "Front side with clear number visibility"
            )}

            {renderDocumentOption(
              "secondary",
              "Upload Secondary ID",
              "PAN Card / Driving License / Passport"
            )}
          </>
        ) : (
          <>
            <Text className="text-lg font-pbold text-gray-800 mb-4">
              Upload Selfie with Aadhar
            </Text>

            {renderDocumentOption(
              "selfie",
              "Upload Selfie",
              "Clear photo holding Aadhar card with visible number"
            )}
          </>
        )}

        {verificationMethod && (documents.aadhar || documents.selfie) && (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`bg-violet-600 rounded-xl py-4 mb-6 mt-4 ${
              isLoading ? "opacity-70" : ""
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-pbold text-center text-lg">
                Submit for Verification
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerificationScreen;
