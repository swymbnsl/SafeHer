import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSkip = async () => {
    await AsyncStorage.setItem('userToken', 'skip-token');
    router.replace('/(tabs)');
  };

  const handleSignUp = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await AsyncStorage.setItem('userToken', 'dummy-token');
      router.replace('/(tabs)');
    } catch (error) {
      setError('Sign up failed. Please try again.');
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={[
          '#9f86ff',
          '#b39dff',
          '#c7b4ff',
          '#dccbff',
          '#f0e6ff',
          '#dccbff',
          '#c7b4ff',
          '#b39dff',
          '#9f86ff'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      <View className="absolute inset-0 backdrop-blur-md bg-white/10" />
      
      <TouchableOpacity 
        className="absolute top-16 right-6 bg-white/80 px-6 py-2 rounded-full z-20"
        onPress={handleSkip}
      >
        <Text className="text-[#9f86ff] font-pbold">Skip</Text>
      </TouchableOpacity>
      
      <ScrollView className="flex-1">
        <View className="flex-1 justify-center px-6 md:px-8 py-20">
          <View className="bg-white/80 rounded-3xl p-6 md:p-8 backdrop-blur-lg">
            <TouchableOpacity 
              className="absolute top-6 left-6"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#4a3b6b" />
            </TouchableOpacity>

            <Text className="text-3xl font-pbold text-[#4a3b6b] mb-10 text-center mt-4">
              Create Account
            </Text>

            {error ? (
              <Text className="text-red-500 mb-6 font-pmedium text-center">{error}</Text>
            ) : null}

            <View className="space-y-6">
              <View>
                <Text className="text-[#6f5c91] font-pmedium mb-2">Full Name</Text>
                <TextInput
                  className="bg-white/90 rounded-xl p-4 text-[#4a3b6b] font-pmedium"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                />
              </View>

              <View>
                <Text className="text-[#6f5c91] font-pmedium mb-2">Email</Text>
                <TextInput
                  className="bg-white/90 rounded-xl p-4 text-[#4a3b6b] font-pmedium"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-[#6f5c91] font-pmedium mb-2">Password</Text>
                <View className="relative">
                  <TextInput
                    className="bg-white/90 rounded-xl p-4 text-[#4a3b6b] font-pmedium pr-12"
                    placeholder="Create a password"
                    value={formData.password}
                    onChangeText={(text) => setFormData({...formData, password: text})}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    className="absolute right-4 top-4"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={24} 
                      color="#6f5c91" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-[#6f5c91] font-pmedium mb-2">Confirm Password</Text>
                <View className="relative">
                  <TextInput
                    className="bg-white/90 rounded-xl p-4 text-[#4a3b6b] font-pmedium pr-12"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity 
                    className="absolute right-4 top-4"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={24} 
                      color="#6f5c91" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                className="bg-[#9f86ff] rounded-xl py-4 mt-8"
                onPress={handleSignUp}
              >
                <Text className="text-white font-pbold text-lg text-center">
                  Sign Up
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mt-6"
                onPress={() => router.push('/login')}
              >
                <Text className="text-[#4a3b6b] font-pmedium text-center">
                  Already have an account? Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
