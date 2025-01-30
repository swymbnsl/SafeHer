import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const QuickActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="items-center bg-white p-4 rounded-2xl"
    style={{
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 5,
    }}
  >
    <View className="bg-violet-200 p-3 rounded-xl mb-3">
      <Ionicons name={icon} size={22} color="#6D28D9" />
    </View>
    <Text className="font-pmedium text-gray-800 text-sm">{label}</Text>
  </TouchableOpacity>
);

export default QuickActionButton;
