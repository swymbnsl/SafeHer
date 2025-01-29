import { AppState } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export const emailSignUp = async (email, password, name) => {
  const {
    data: { session },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    throw new Error("Supabase error", { cause: error.message });
  }

  if (!session) {
    throw new Error("Supabase error", {
      cause: "Please check your inbox for email verification!",
    });
  }
  console.log("session after signup", session);
  const { data } = await supabase.auth.getUser();
  console.log("user", data.user);
  console.log("Tryna Creating in db");
  const createdUser = await createUserInDB(
    name,
    data.user?.email,
    null,
    data.user?.id
  );
  if (createdUser.error) {
    throw new Error("Supabase error", { cause: createdUser.error });
  }
  console.log("created user", createdUser);
  return createdUser.data;
};

const createUserInDB = async (name, email, avatar, user_id) => {
  console.log("Creating in db");
  const response = await supabase
    .from("users")
    .insert({ name, email, avatar, user_id })
    .select();
  return response;
};

export const getUserFromDb = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  const { data: user, error: dbError } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (dbError || !user) {
    throw new Error("Database error", {
      cause: dbError?.message || "User not found in database",
    });
  }

  return user;
};
