import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ActiveTripCard = ({
  name,
  posterName,
  posterAvatar,
  posterAge,
  posterInterests = [],
  time,
  returnTime,
  distance,
  companions,
  image,
  coordinates,
  fullWidth = false,
}) => (
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
    <View className="h-32 bg-gray-200">
      {/* Add ImageBackground component here */}
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
          <View className="w-10 h-10 rounded-full bg-gray-200 mr-3">
            {/* Add Image component for posterAvatar */}
          </View>
          <View className="flex-1">
            <Text className="text-base font-psemibold text-gray-800">
              {posterName}
            </Text>
            <Text className="text-sm text-gray-600">{posterAge} years</Text>
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
            {time} - {returnTime}
          </Text>
        </View>

        <View className="flex-row items-center">
          <View className="bg-violet-100 p-1.5 rounded-full mr-2">
            <Ionicons name="location-outline" size={16} color="#6D28D9" />
          </View>
          <Text className="text-gray-700 font-pmedium">{distance} away</Text>
        </View>

        <View className="flex-row items-center">
          <View className="bg-violet-100 p-1.5 rounded-full mr-2">
            <Ionicons name="people-outline" size={16} color="#6D28D9" />
          </View>
          <Text className="text-gray-700 font-pmedium">{companions} going</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default ActiveTripCard;
