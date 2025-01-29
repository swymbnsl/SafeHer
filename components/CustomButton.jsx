import { Text, TouchableOpacity } from "react-native";

const CustomButton = ({
  onPress,
  title,
  className = "",
  textClassName = "",
  isLoading = false,
  isDisabled = false,
}) => {
  return (
    <TouchableOpacity
      className={`bg-violet-600 py-4 rounded-xl active:bg-violet-700 ${
        isDisabled || isLoading ? "opacity-50" : ""
      } ${className}`}
      onPress={onPress}
      accessibilityLabel={`${title} button`}
      accessibilityRole="button"
      disabled={isDisabled || isLoading}
      activeOpacity={0.5}
    >
      <Text className={`text-center font-psemibold text-base ${textClassName}`}>
        {isLoading ? "Loading..." : title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
