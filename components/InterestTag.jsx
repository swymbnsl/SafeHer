import { TouchableOpacity, Text } from "react-native";

const InterestTag = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-full ${
      selected ? "bg-violet-600" : "bg-violet-50"
    }`}
  >
    <Text
      className={`font-pmedium ${selected ? "text-white" : "text-violet-600"}`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default InterestTag;
