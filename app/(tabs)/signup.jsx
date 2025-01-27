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
      // Add your signup logic here
      await AsyncStorage.setItem('userToken', 'dummy-token');
      router.replace('/(tabs)');
    } catch (error) {
      setError('Sign up failed. Please try again.');
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#9f86ff', '#f0e6ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      
      <ScrollView className="flex-1">
        <View className="flex-1 justify-center px-8 py-20">
          <View className="bg-white/80 rounded-3xl p-8 backdrop-blur-lg">
            <TouchableOpacity 
              className="absolute top-6 left-6 z-10"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#4a3b6b" />
            </TouchableOpacity>

            <Text className="text-3xl font-pbold text-[#4a3b6b] mb-8 text-center">
              Create Account
            </Text>

            {error ? (
              <Text className="text-red-500 mb-4 font-pmedium text-center">{error}</Text>
            ) : null}

            <View className="space-y-4">
              <View>
                <Text className="text-[#6f5c91] font-pmedium mb-2 ">Full Name</Text>
                <TextInput
                  className="bg-white/90 rounded-xl p-4 text-[#4a3b6b] font-pmedium mb-4"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                />
              </View>

              <View>
                <Text className="text-[#6f5c91] font-pmedium mb-2">Email</Text>
                <TextInput
                  className="bg-white/90 rounded-xl p-4 text-[#4a3b6b] font-pmedium mb-4"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-[#6f5c91] font-pmedium mb-2">Password</Text>
                <TextInput
                  className="bg-white/90 rounded-xl p-4 text-[#4a3b6b] font-pmedium mb-4"
                  placeholder="Create a password"
                  value={formData.password}
                  onChangeText={(text) => setFormData({...formData, password: text})}
                  secureTextEntry
                />
              </View>

              <View>
                <Text className="text-[#6f5c91] font-pmedium mb-2">Confirm Password</Text>
                <TextInput
                  className="bg-white/90 rounded-xl p-4 text-[#4a3b6b] font-pmedium mb-4"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                className="bg-[#9f86ff] rounded-xl py-4 mt-6"
                onPress={handleSignUp}
              >
                <Text className="text-white font-pbold text-lg text-center">
                  Sign Up
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mt-4"
                onPress={() => router.push('/login')}
              >
                <Text className="text-[#4a3b6b] font-pmedium text-center">
                  Already have an account? <Text className="text-[#9f86ff] font-pbold underline">Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 