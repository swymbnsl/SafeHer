import { TouchableOpacity, Text } from "react-native";

const FilterOption = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-xl ${
      selected ? "bg-violet-600" : "bg-gray-50"
    }`}
  >
    <Text
      className={`font-pmedium ${selected ? "text-white" : "text-gray-600"}`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default FilterOption;
