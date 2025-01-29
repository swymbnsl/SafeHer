import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';

const Toast = ({ message, type = 'success', onHide }) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  }, []);

  return (
    <Animated.View 
      style={{ opacity }}
      className="absolute top-20 left-6 right-6 bg-[#9f86ff] rounded-xl p-4 items-center"
    >
      <Text className="text-white font-pbold">{message}</Text>
    </Animated.View>
  );
};

export default Toast; 