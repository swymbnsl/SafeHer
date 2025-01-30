import { View, Text, TouchableOpacity } from "react-native";

const RequestCard = ({ name, location, time, status }) => (
  <View
    className="bg-white p-4 rounded-2xl mb-3"
    style={{
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
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-violet-200 rounded-full mr-3">
          {/* Profile Image */}
        </View>
        <View>
          <Text className="text-base font-psemibold text-gray-800">{name}</Text>
          <Text className="text-gray-600 font-plight text-sm">{location}</Text>
        </View>
      </View>
      <Text className="text-gray-500 font-plight text-sm">{time}</Text>
    </View>
    <View className="flex-row">
      <TouchableOpacity
        className={`flex-1 py-2.5 rounded-xl mr-2 ${
          status === "pending" ? "bg-violet-600" : "bg-gray-100"
        }`}
      >
        <Text
          className={`text-center font-pmedium ${
            status === "pending" ? "text-white" : "text-gray-700"
          }`}
        >
          {status === "pending" ? "Accept" : "Accepted"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 py-2.5 rounded-xl border-2 border-violet-600">
        <Text className="text-violet-700 text-center font-pmedium">
          Message
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default RequestCard;
