import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { decode } from "base64-arraybuffer";
import * as Location from "expo-location";

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
  const { data } = await supabase.auth.getUser();
  const createdUser = await createUserInDB(
    name,
    data.user?.email,
    null,
    data.user?.id
  );
  if (createdUser.error) {
    throw new Error("Supabase error", { cause: createdUser.error });
  }
  return createdUser.data;
};

const createUserInDB = async (name, email, avatar, user_id) => {
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

export const getAvailableTrips = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  const { data: trips, error } = await supabase
    .from("trips")
    .select(
      `
      *,
      users:created_by (
        name,
        avatar
      )
    `
    )
    .eq("status", "active")
    .neq("created_by", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch trips", { cause: error });
  }

  return trips;
};

export const getActiveTrips = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  const { data: trips, error } = await supabase
    .from("trips")
    .select(
      `
      *,
      users:created_by (
        name,
        avatar
      )
    `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error("Failed to fetch active trips", { cause: error });
  }

  return trips;
};

export const createTrip = async (tripData) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  let imageUrl = null;
  if (tripData.image) {
    imageUrl = await uploadTripImage(tripData.image);
  }

  // Combine dates with respective times
  const startDateTime = new Date(tripData.startDate);
  const endDateTime = new Date(tripData.endDate);
  const startTime = new Date(tripData.startTime);
  const endTime = new Date(tripData.endTime);

  startDateTime.setHours(startTime.getHours());
  startDateTime.setMinutes(startTime.getMinutes());
  endDateTime.setHours(endTime.getHours());
  endDateTime.setMinutes(endTime.getMinutes());

  const formattedTrip = {
    name: tripData.name,
    location: {
      address: tripData.location,
      coordinates: tripData.coordinates || null,
    },
    start_time: startDateTime.toISOString(),
    end_time: endDateTime.toISOString(),
    description: tripData.description || null,
    created_by: session.user.id,
    max_companions: parseInt(tripData.companions),
    desired_interests: tripData.interests,
    status: "active",
    image: imageUrl,
  };

  const { data, error } = await supabase
    .from("trips")
    .insert(formattedTrip)
    .select("*, users!trips_created_by_fkey (name, avatar)")
    .single();

  if (error) {
    throw new Error("Failed to create trip", { cause: error });
  }

  return data;
};

export const uploadTripImage = async (image) => {
  try {
    await supabase.storage
      .from("trip-images")
      .upload(image.filePath, decode(image.base64), {
        contentType: image.contentType,
      });
    const { data: publicUrl } = supabase.storage
      .from("trip-images")
      .getPublicUrl(image.filePath);
    return publicUrl.publicUrl;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error("Failed to upload image", { cause: error });
  }
};

export const getUserTrips = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

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
    .eq("created_by", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch user trips", { cause: error });
  }

  return trips;
};

export const getFriends = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  const { data: currentUser, error: userError } = await supabase
    .from("users")
    .select("friends")
    .eq("user_id", session.user.id)
    .single();

  if (userError) {
    throw new Error("Failed to fetch user's friends", { cause: userError });
  }

  if (!currentUser.friends || currentUser.friends.length === 0) {
    return [];
  }

  // Get friends' basic info and their friends count
  const { data: friendsData, error: friendsError } = await supabase
    .from("users")
    .select("user_id, name, avatar, location, friends")
    .in("user_id", currentUser.friends);

  if (friendsError) {
    throw new Error("Failed to fetch friends data", { cause: friendsError });
  }

  // Get trip counts and recent trips for all friends
  const friendsWithTrips = await Promise.all(
    friendsData.map(async (friend) => {
      const { data: trips, error: tripsError } = await supabase
        .from("trips")
        .select("id, name, start_time, image")
        .eq("created_by", friend.user_id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (tripsError) {
        console.error("Error fetching trips for friend:", tripsError);
        return {
          ...friend,
          trips: 0,
          recentTrips: [],
          friends: friend.friends?.length || 0,
          mutualFriends: currentUser.friends.filter((id) =>
            friend.friends?.includes(id)
          ).length,
        };
      }

      return {
        id: friend.user_id,
        name: friend.name,
        avatar: friend.avatar,
        location: friend.location,
        mutualFriends: currentUser.friends.filter((id) =>
          friend.friends?.includes(id)
        ).length,
        friends: friend.friends?.length || 0,
        trips: trips.length,
        recentTrips: trips.map((trip) => ({
          id: trip.id,
          name: trip.name,
          date: trip.start_time,
          image: trip.image,
        })),
      };
    })
  );

  return friendsWithTrips;
};

export const getFriendRequests = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("friend_requests")
    .eq("user_id", session.user.id)
    .single();
  if (userError) {
    throw new Error("Failed to fetch friend requests", { cause: userError });
  }

  if (!user.friend_requests || user.friend_requests.length === 0) {
    return [];
  }

  const requestUserIds = user.friend_requests.map((request) => request);
  const { data: requestersData, error: requestersError } = await supabase
    .from("users")
    .select("user_id, name, avatar, age, bio, interests")
    .in("user_id", requestUserIds);
  if (requestersError) {
    throw new Error("Failed to fetch requesters data", {
      cause: requestersError,
    });
  }

  return requestersData.map((requester) => ({
    id: requester.user_id,
    name: requester.name,
    avatar: requester.avatar,
    age: requester.age,
    bio: requester.bio,
    interests: requester.interests,
  }));
};

export const acceptFriendRequest = async (requesterId) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  // Get current user's data
  const { data: currentUser, error: fetchError } = await supabase
    .from("users")
    .select("friends, friend_requests")
    .eq("user_id", session.user.id)
    .single();

  if (fetchError) {
    throw new Error("Failed to fetch user data", { cause: fetchError });
  }

  // Prepare updated arrays
  const updatedFriends = [...(currentUser.friends || []), requesterId];
  const updatedRequests = (currentUser.friend_requests || []).filter(
    (id) => id !== requesterId
  );

  // Update current user's friends and friend_requests
  const { data: user, error: userError } = await supabase
    .from("users")
    .update({
      friends: updatedFriends,
      friend_requests: updatedRequests,
    })
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (userError) {
    console.log("User error:", userError.message);
    throw new Error("Failed to accept friend request", { cause: userError });
  }

  // Get requester's current friends array
  const { data: requester, error: fetchRequesterError } = await supabase
    .from("users")
    .select("friends")
    .eq("user_id", requesterId)
    .single();

  if (fetchRequesterError) {
    throw new Error("Failed to fetch requester data", {
      cause: fetchRequesterError,
    });
  }

  // Update requester's friends array
  const { error: requesterError } = await supabase
    .from("users")
    .update({
      friends: [...(requester.friends || []), session.user.id],
    })
    .eq("user_id", requesterId);

  if (requesterError) {
    throw new Error("Failed to update requester's friends list", {
      cause: requesterError,
    });
  }

  return user;
};

export const declineFriendRequest = async (requesterId) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .update({
      friend_requests: supabase.sql`array_remove(friend_requests, jsonb_build_object('user_id', ${requesterId}))`,
    })
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (userError) {
    throw new Error("Failed to decline friend request", { cause: userError });
  }

  return user;
};

export const removeFriend = async (friendId) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  // First get the current friends array
  const { data: currentUser, error: fetchError } = await supabase
    .from("users")
    .select("friends")
    .eq("user_id", session.user.id)
    .single();

  if (fetchError) {
    throw new Error("Failed to fetch user data", { cause: fetchError });
  }

  // Filter out the friend to remove
  const updatedFriends = (currentUser.friends || []).filter(
    (id) => id !== friendId
  );

  // Update current user's friends list
  const { error: userError } = await supabase
    .from("users")
    .update({ friends: updatedFriends })
    .eq("user_id", session.user.id);

  if (userError) {
    throw new Error("Failed to remove friend", { cause: userError });
  }

  // Do the same for the friend's list
  const { data: friendUser, error: fetchFriendError } = await supabase
    .from("users")
    .select("friends")
    .eq("user_id", friendId)
    .single();

  if (fetchFriendError) {
    throw new Error("Failed to fetch friend data", { cause: fetchFriendError });
  }

  const updatedFriendsList = (friendUser.friends || []).filter(
    (id) => id !== session.user.id
  );

  const { error: friendError } = await supabase
    .from("users")
    .update({ friends: updatedFriendsList })
    .eq("user_id", friendId);

  if (friendError) {
    throw new Error("Failed to update friend's list", { cause: friendError });
  }

  return true;
};

export const updateUserLocation = async (latitude, longitude) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  const location = {
    latitude,
    longitude,
  };

  const { data, error } = await supabase
    .from("users")
    .update({ location })
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) {
    throw new Error("Failed to update location", { cause: error });
  }

  return data;
};

export const sendFriendRequest = async (recipientId) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  // Check if request already exists
  const { data: recipient, error: recipientError } = await supabase
    .from("users")
    .select("friend_requests")
    .eq("user_id", recipientId)
    .single();

  if (recipientError) {
    throw new Error("Failed to check recipient", { cause: recipientError });
  }
  // Ensure friend_requests is an array
  const currentRequests = Array.isArray(recipient.friend_requests)
    ? recipient.friend_requests
    : [];

  // Check if request is already pending
  if (currentRequests.includes(session.user.id)) {
    throw new Error("Friend request already sent");
  }

  // Add friend request to recipient's friend_requests array
  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update({
      friend_requests: [...currentRequests, session.user.id],
    })
    .eq("user_id", recipientId);

  if (updateError || !updatedUser) {
    throw new Error("Failed to send friend request", {
      cause: updateError || "No update confirmation received",
    });
  }

  return updatedUser;
};

export const uploadAvatarImage = async (image) => {
  try {
    await supabase.storage
      .from("avatars")
      .upload(image.filePath, decode(image.base64), {
        contentType: image.contentType,
      });
    const { data: publicUrl } = supabase.storage
      .from("avatars")
      .getPublicUrl(image.filePath);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error("Avatar upload failed:", error);
    throw new Error("Failed to upload avatar", { cause: error });
  }
};

export const updateProfile = async (profileData) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  let avatarUrl = null;
  if (profileData.avatar) {
    avatarUrl = await uploadAvatarImage(profileData.avatar);
  }

  const formattedProfile = {
    name: profileData.name,
    avatar: avatarUrl || profileData.avatar,
    email: profileData.email,
  };

  const { data, error } = await supabase
    .from("users")
    .update(formattedProfile)
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) {
    throw new Error("Failed to update profile", { cause: error });
  }

  return data;
};

export const getOrCreateConversation = async (otherUserId) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No session found");

  // Check if conversation exists
  const { data: existingConv } = await supabase
    .from("conversations")
    .select("id")
    .contains("participants", [session.user.id, otherUserId])
    .single();

  if (existingConv) return existingConv.id;

  // Create new conversation
  const { data: newConv, error } = await supabase
    .from("conversations")
    .insert({
      participants: [session.user.id, otherUserId],
    })
    .select("id")
    .single();

  if (error) throw error;
  return newConv.id;
};

export const sendMessage = async (conversationId, content) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No session found");

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: session.user.id,
      content,
    })
    .select("*, users!sender_id (name, avatar)")
    .single();

  if (error) throw error;
  return data;
};

export const getMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      users!sender_id (
        name,
        avatar
      )
    `
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};

export const startLocationSharing = (userId, onLocationUpdate) => {
  return supabase
    .channel(`public:users:user_id=eq.${userId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "users",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new.location) {
          onLocationUpdate(payload.new.location);
        }
      }
    )
    .subscribe();
};

const getCurrentPosition = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Permission to access location was denied");
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return location;
};

export const updateLocationSharingStatus = async (isSharing) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  const { data, error } = await supabase
    .from("users")
    .update({ sharing_location: isSharing })
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) {
    throw new Error("Failed to update location sharing status", {
      cause: error,
    });
  }

  return data;
};

export const startSharingMyLocation = async (intervalMs = 2000) => {
  try {
    // First update the sharing status
    await updateLocationSharingStatus(true);

    // Get initial position and update it
    const initialPosition = await getCurrentPosition();
    if (initialPosition) {
      await updateUserLocation(
        initialPosition.coords.latitude,
        initialPosition.coords.longitude
      );
    }

    // Start the interval for continuous updates
    const locationInterval = setInterval(async () => {
      try {
        const position = await getCurrentPosition();
        if (position) {
          await updateUserLocation(
            position.coords.latitude,
            position.coords.longitude
          );
        }
      } catch (error) {
        console.error("Error updating location:", error);
      }
    }, intervalMs);

    // Return cleanup function
    return async () => {
      clearInterval(locationInterval);
      try {
        await updateLocationSharingStatus(false);
      } catch (error) {
        console.error("Error stopping location sharing:", error);
      }
    };
  } catch (error) {
    // If anything fails during setup, ensure sharing status is false
    try {
      await updateLocationSharingStatus(false);
    } catch (cleanupError) {
      console.error("Error cleaning up sharing status:", cleanupError);
    }
    throw new Error("Failed to start location sharing", { cause: error });
  }
};

export const getUserTripCount = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  const { count, error } = await supabase
    .from("trips")
    .select("*", { count: "exact", head: true })
    .eq("created_by", session.user.id);

  if (error) {
    throw new Error("Failed to fetch trip count", { cause: error });
  }

  return count || 0;
};

export const updateTrip = async (tripData) => {
  console.log("Starting updateTrip with data:", tripData);

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error(
      "Authentication error:",
      sessionError?.message || "No active session found"
    );
    throw new Error("Authentication error", {
      cause: sessionError?.message || "No active session found",
    });
  }

  console.log("Session found for user:", session.user.id);

  let imageUrl = tripData.image;
  if (tripData.image && tripData.image.base64) {
    console.log("Uploading new trip image...");
    imageUrl = await uploadTripImage(tripData.image);
    console.log("Image uploaded successfully:", imageUrl);
  }

  const formattedTrip = {
    name: tripData.name,
    location: tripData.location,
    start_time: tripData.start_time,
    description: tripData.description || null,
    max_companions: tripData.max_companions,
    status: "active",
    image: imageUrl,
  };

  console.log("Formatted trip data:", formattedTrip);

  const { data, error } = await supabase
    .from("trips")
    .update(formattedTrip)
    .eq("id", tripData.id)
    .select("*, users!trips_created_by_fkey (name, avatar)")
    .single();

  if (error) {
    console.error("Failed to update trip:", error);
    throw new Error("Failed to update trip", { cause: error });
  }

  console.log("Trip updated successfully:", data);
  return data;
};
