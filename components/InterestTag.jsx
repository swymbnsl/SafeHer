import { TouchableOpacity, Text } from "react-native";

const InterestTag = ({ label }) => (
  <TouchableOpacity className="px-3 py-1.5 bg-violet-100 rounded-lg">
    <Text className="font-pmedium text-violet-600 text-sm">{label}</Text>
  </TouchableOpacity>
);

export default InterestTag;
