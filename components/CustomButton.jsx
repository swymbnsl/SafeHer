import { Text, TouchableOpacity } from "react-native";

const CustomButton = ({
  onPress,
  title,
  className = "",
  textClassName = "",
}) => {
  return (
    <TouchableOpacity
      className={`bg-violet-600 py-4 rounded-xl active:bg-violet-700 ${className}`}
      onPress={onPress}
      accessibilityLabel={`${title} button`}
      accessibilityRole="button"
    >
      <Text
        className={`text-white text-center font-psemibold text-base ${textClassName}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
