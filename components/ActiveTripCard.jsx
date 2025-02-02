import { View, Text, TouchableOpacity, Linking, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatTripDuration } from "../utils/dateFormatters";
import { calculateDistance } from "../utils/locationUtils";
import { sendFriendRequest } from "../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

const DEFAULT_TRIP_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk_Xm-CUa-epUv5KYdea2WIAOozwkDtWUbaA&s";

const ActiveTripCard = ({
  id,
  name,
  posterName,
  posterAvatar,
  posterInterests = [],
  start_time,
  end_time,
  location,
  userLocation,
  companions,
  image,
  age,
  fullWidth = false,
  createdBy,
  onRequestSent,
  isFriend = false,
  hideActions = false,
  hideDistance = false,
}) => {
  console.log("age", age);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkRequestStatus = async () => {
      try {
        const { data: recipient } = await supabase
          .from("users")
          .select("friend_requests")
          .eq("user_id", createdBy)
          .single();

        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsPending(recipient?.friend_requests?.includes(session?.user?.id));
      } catch (error) {
        console.log("Error checking request status:", error);
      }
    };

    if (createdBy) {
      checkRequestStatus();
    }
  }, [createdBy]);

  const distanceText =
    userLocation && location?.coordinates
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          location.coordinates.lat,
          location.coordinates.lng
        )
      : "Distance unavailable";

  const handleFriendRequest = async () => {
    try {
      setIsRequesting(true);
      await sendFriendRequest(createdBy);
      onRequestSent?.("Friend request sent successfully!");
    } catch (error) {
      onRequestSent?.(error.message, "error");
    } finally {
      setIsRequesting(false);
    }
  };

  const renderActionButton = () => {
    if (isFriend) {
      return (
        <TouchableOpacity
          className="bg-violet-600 px-4 py-2 rounded-xl flex-row items-center"
          onPress={() =>
            router.push({
              pathname: "/(tabs)/chat",
              params: { name: posterName, id: createdBy },
            })
          }
        >
          <Ionicons name="chatbubble-outline" size={18} color="white" />
          <Text className="text-white font-pmedium ml-2">Message</Text>
        </TouchableOpacity>
      );
    }

    const isDisabled = isPending || isRequesting;

    return (
      <TouchableOpacity
        className={`px-4 py-2 rounded-xl flex-row items-center justify-center ${
          isDisabled ? "bg-gray-200 border border-gray-300" : "bg-violet-600"
        }`}
        onPress={handleFriendRequest}
        disabled={isDisabled}
      >
        <Ionicons
          name="person-add-outline"
          size={18}
          color={isDisabled ? "#9CA3AF" : "white"}
        />
        <Text
          className={`font-pmedium ml-2 ${
            isDisabled ? "text-gray-500" : "text-white"
          }`}
        >
          {isPending
            ? "Request Pending"
            : isRequesting
            ? "Sending..."
            : "Add Friend"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      className={`rounded-2xl overflow-hidden bg-white ${
        fullWidth ? "w-full" : "mr-4"
      }`}
      style={{
        width: fullWidth ? "100%" : 280,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        elevation: 5,
        borderWidth: 1,
        borderColor: "#F3F4F6",
      }}
    >
      <View
        className="bg-gray-200 overflow-hidden"
        style={{
          height: 150,
        }}
      >
        <Image
          source={{
            uri: image || DEFAULT_TRIP_IMAGE,
          }}
          className="w-full h-full"
          resizeMode="cover"
          style={{
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        />
      </View>

      <View className="p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-pbold text-gray-800">{name}</Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`
              )
            }
            className="bg-violet-200 p-2 rounded-full"
          >
            <Ionicons name="map-outline" size={18} color="#6D28D9" />
          </TouchableOpacity>
        </View>

        <View className="mb-3">
          <View className="flex-row items-center mb-2">
            <View className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-violet-100 mr-3 items-center justify-center">
              {posterAvatar ? (
                <Image
                  source={{ uri: posterAvatar }}
                  resizeMode="contain"
                  className="w-full h-full"
                />
              ) : (
                <Text className="text-violet-700 font-pbold text-xl">
                  {posterName?.charAt(0)?.toUpperCase()}
                </Text>
              )}
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-base font-psemibold text-gray-800 mb-0.5">
                {posterName}
              </Text>
              <Text className="text-sm text-gray-600">{age} years</Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {posterInterests?.map((interest, index) => (
              <View
                key={index}
                className="bg-violet-100 px-3 py-1 rounded-full border border-violet-200"
              >
                <Text className="text-violet-700 text-xs font-pmedium">
                  {interest}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="space-y-2">
          <View className="flex-row items-center">
            <View className="bg-violet-100 p-1.5 rounded-full mr-2">
              <Ionicons name="time-outline" size={16} color="#6D28D9" />
            </View>
            <Text className="text-gray-700 font-pmedium flex-1">
              {formatTripDuration(start_time, end_time)}
            </Text>
          </View>

          {!hideDistance && (
            <View className="flex-row items-center">
              <View className="bg-violet-100 p-1.5 rounded-full mr-2">
                <Ionicons name="location-outline" size={16} color="#6D28D9" />
              </View>
              <Text className="text-gray-700 font-pmedium">{distanceText}</Text>
            </View>
          )}

          <View className="flex-row items-center">
            <View className="bg-violet-100 p-1.5 rounded-full mr-2">
              <Ionicons name="people-outline" size={16} color="#6D28D9" />
            </View>
            <Text className="text-gray-700 font-pmedium">
              {companions} going
            </Text>
          </View>
        </View>

        {!hideActions && <View className="mt-4">{renderActionButton()}</View>}
      </View>
    </TouchableOpacity>
  );
};

export default ActiveTripCard;
