import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CustomTextInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  showPassword,
  togglePassword,
  keyboardType = "default",
  autoCapitalize = "sentences",
}) => {
  return (
    <View>
      <Text className="text-[#6f5c91] font-pmedium mb-2">{label}</Text>
      <View className="flex-row items-center relative">
        <TextInput
          className={`bg-white/90 rounded-xl p-4 text-[#4a3b6b] font-pmedium w-full ${
            secureTextEntry ? "pr-12" : ""
          }`}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <TouchableOpacity
            className="absolute right-4"
            onPress={togglePassword}
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#6f5c91"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomTextInput;
