import React, { useEffect } from "react";
import { Animated, Dimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

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
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transform: [{ translateX }],
      }}
    >
      <LinearGradient
        colors={[
          "#9f86ff",
          "#b39dff",
          "#c7b4ff",
          "#dccbff",
          "#f0e6ff",
          "#dccbff",
          "#c7b4ff",
          "#b39dff",
          "#9f86ff",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: width * 3, height: "100%" }}
      />
      <View
        className="absolute inset-0 backdrop-blur-md bg-white/10"
        style={{ width: width * 3 }}
      />
    </Animated.View>
  );
};

export default AnimatedGradient;
