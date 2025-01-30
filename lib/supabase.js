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

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error("Sign out error", { cause: error });
  }
  console.log("User signed out successfully");
};

export const emailSignIn = async (email, password) => {
  const {
    data: { session },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Authentication error", { cause: error });
  }

  if (!session) {
    throw new Error("Authentication error", {
      cause: { message: "No session found after login" },
    });
  }

  const user = await getUserFromDb();
  return user;
};

export const getActiveTrips = async () => {
  const { data: trips, error } = await supabase
    .from("trips")
    .select(
      `
      *,
      users!trips_created_by_fkey (
        name,
        avatar
      )
    `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch active trips", { cause: error });
  }

  return trips;
};
