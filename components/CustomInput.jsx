import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  additionalStyle = "",
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className={`mb-4 ${additionalStyle}`}>
      <Text className="text-gray-700 text-sm font-pmedium mb-2 ml-1">
        {label}
      </Text>
      <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200">
        <TextInput
          className={`flex-1 py-3.5 font-pregular px-4`}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize="none"
          placeholderTextColor="#9CA3AF"
          accessibilityLabel={`${label} input`}
        />

        {secureTextEntry && (
          <TouchableOpacity
            className="px-4"
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            accessibilityLabel={
              isPasswordVisible ? "Hide password" : "Show password"
            }
            accessibilityRole="button"
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomInput;
