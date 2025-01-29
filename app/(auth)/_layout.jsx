import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ animation: "slide_from_left" }} />
      <Stack.Screen
        name="signup"
        options={{ animation: "slide_from_bottom" }}
      />
    </Stack>
  );
}
