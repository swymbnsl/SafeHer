import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AnimatedGradient = () => {
  const translateX = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -width,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transform: [{ translateX }],
      }}
    >
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
        style={{ width: width * 3, height: '100%' }}
      />
      <View 
        className="absolute inset-0 backdrop-blur-md bg-white/10"
        style={{ width: width * 3 }}
      />
    </Animated.View>
  );
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSkip = async () => {
    await AsyncStorage.setItem('userToken', 'skip-token');
    router.replace('/(tabs)/home');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      await AsyncStorage.setItem('userToken', 'dummy-token');
      router.replace('/(tabs)');
    } catch (error) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <View className="flex-1">
      <AnimatedGradient />
      
      <TouchableOpacity 
        className="absolute top-16 right-6 bg-white/80 px-6 py-2 rounded-full z-20"
        onPress={handleSkip}
      >
        <Text className="text-[#9f86ff] font-pbold">Skip</Text>
      </TouchableOpacity>
      
      <View className="flex-1 justify-center px-6 md:px-8 z-10">
        <View className="bg-white/80 rounded-3xl p-6 md:p-8 backdrop-blur-lg">
          <Text className="text-3xl font-pbold text-[#4a3b6b] mb-10 text-center">
            Welcome Back
          </Text>

          {error ? (
            <Text className="text-red-500 mb-6 font-pmedium text-center">{error}</Text>
          ) : null}

          <View className="space-y-6">
            <View>
              <Text className="text-[#6f5c91] font-pmedium mb-2">Email</Text>
              <TextInput
                className="bg-white/90 rounded-xl p-4 text-[#4a3b6b] font-pmedium mb-4"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-[#6f5c91] font-pmedium mb-2">Password</Text>
              <View className="relative">
                <TextInput
                  className="bg-white/90 rounded-xl p-4 text-[#4a3b6b] font-pmedium pr-12"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
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

            <TouchableOpacity
              className="bg-[#9f86ff] rounded-xl py-4 mt-8"
              onPress={handleLogin}
            >
              <Text className="text-white font-pbold text-lg text-center">
                Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-6"
              onPress={() => router.push('/signup')}
            >
              <Text className="text-[#4a3b6b] font-pmedium text-center">
                Don't have an account? <Text className="text-[#9f86ff] font-pbold underline">Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
} 