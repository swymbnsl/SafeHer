import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Toast from "@/components/Toast";
import {
  getFriends,
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from "@/lib/supabase";

const FriendCard = ({ friend, onViewProfile, onRemove, onMessage }) => {
  return (
    <TouchableOpacity
      className="bg-white p-4 rounded-2xl mb-4"
      style={{
        shadowColor: "#7C3AED",
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
      onPress={() => onViewProfile(friend)}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {friend.avatar ? (
            <Image
              source={{ uri: friend.avatar }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-violet-200 items-center justify-center">
              <Text className="text-violet-700 font-pbold text-lg">
                {friend.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="text-gray-800 font-psemibold text-base">
              {friend.name}
            </Text>
            <Text className="text-gray-500 font-plight">
              {friend.mutualFriends} mutual friends
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-4 bg-violet-100 p-2 rounded-xl"
            onPress={() => onMessage(friend)}
          >
            <Ionicons name="chatbubble" size={20} color="#7C3AED" />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-100 p-2 rounded-xl"
            onPress={() => onRemove(friend)}
          >
            <Ionicons name="person-remove" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FriendRequestCard = ({ request, onAccept, onDecline }) => (
  <View
    className="bg-white p-4 rounded-2xl mb-4"
    style={{
      shadowColor: "#7C3AED",
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    }}
  >
    <View className="flex-row items-center mb-3">
      {request.avatar ? (
        <Image
          source={{ uri: request.avatar }}
          className="w-14 h-14 rounded-full"
        />
      ) : (
        <View className="w-14 h-14 rounded-full bg-violet-100 items-center justify-center">
          <Text className="text-violet-700 font-pbold text-xl">
            {request.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View className="ml-3 flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-900 font-pbold text-lg">
            {request.name}
          </Text>
          <Text className="text-gray-500 font-pmedium">{request.age} y/o</Text>
        </View>
        <Text
          className="text-gray-500 font-pmedium text-sm mt-0.5"
          numberOfLines={2}
        >
          {request.bio}
        </Text>
      </View>
    </View>

    <View className="flex-row flex-wrap gap-2 mb-4">
      {request.interests?.map((interest, index) => (
        <View key={index} className="bg-violet-50 px-3 py-1 rounded-full">
          <Text className="text-violet-600 font-pmedium text-sm">
            {interest}
          </Text>
        </View>
      ))}
    </View>

    <View className="flex-row gap-2">
      <TouchableOpacity
        className="flex-1 bg-violet-600 py-2.5 rounded-xl"
        onPress={() => onAccept(request)}
      >
        <Text className="text-white font-pbold text-center">Accept</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 bg-white py-2.5 rounded-xl border border-red-500"
        onPress={() => onDecline(request)}
      >
        <Text className="text-red-500 font-pbold text-center">Decline</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const ProfileModal = ({ visible, onClose, profile }) => (
  <Modal transparent={true} visible={visible} animationType="slide">
    <View className="flex-1 bg-black/50 justify-end">
      <View className="bg-white rounded-t-3xl p-6 h-[80%]">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-pbold text-[#4a3b6b]">Profile</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#4a3b6b" />
          </TouchableOpacity>
        </View>

        {profile && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="items-center mb-6">
              <Image
                source={{ uri: profile.avatar }}
                className="w-24 h-24 rounded-full mb-4"
              />
              <Text className="text-xl font-pbold text-[#4a3b6b]">
                {profile.name}
              </Text>
              <Text className="text-[#6f5c91] font-pmedium">{profile.bio}</Text>
            </View>

            <View className="flex-row justify-around mb-6">
              <View className="items-center">
                <Text className="text-2xl font-pbold text-[#4a3b6b]">
                  {profile.friends || 0}
                </Text>
                <Text className="text-[#6f5c91] font-pmedium">Friends</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-pbold text-[#4a3b6b]">
                  {profile.trips || 0}
                </Text>
                <Text className="text-[#6f5c91] font-pmedium">Trips</Text>
              </View>
            </View>

            <Text className="text-lg font-pbold text-[#4a3b6b] mb-4">
              Recent Trips
            </Text>
            {profile.recentTrips?.map((trip, index) => (
              <View key={index} className="bg-[#fff4ff] p-4 rounded-xl mb-4">
                <Text className="text-[#4a3b6b] font-pbold">{trip.name}</Text>
                <Text className="text-[#6f5c91] font-pmedium">{trip.date}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  </Modal>
);

const RemoveConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  friendName,
}) => (
  <Modal transparent={true} visible={visible} animationType="fade">
    <View className="flex-1 bg-black/50 justify-center items-center px-6">
      <View className="bg-white rounded-2xl p-6 w-full">
        <Text className="text-lg font-pbold text-[#4a3b6b] mb-4 text-center">
          Remove Friend
        </Text>
        <Text className="text-[#6f5c91] font-pmedium mb-6 text-center">
          Are you sure you want to remove {friendName} from your friends list?
        </Text>
        <View className="flex-row space-x-4">
          <TouchableOpacity
            className="flex-1 bg-[#ff8686] rounded-xl py-3 m-3"
            onPress={onConfirm}
          >
            <Text className="text-white font-pbold text-center">Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-[#9f86ff] rounded-xl py-3 m-3"
            onPress={onClose}
          >
            <Text className="text-white font-pbold text-center">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const Friends = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          setIsLoading(true);
          const [friendsData, requestsData] = await Promise.all([
            getFriends(),
            getFriendRequests(),
          ]);
          setFriends(friendsData);
          setFriendRequests(requestsData);
        } catch (error) {
          console.log("Error:", error.cause);
          setToastMessage(error.cause?.message || "Failed to load friends");
          setShowToast(true);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, [])
  );

  const handleViewProfile = (friend) => {
    setSelectedProfile(friend);
    setShowProfileModal(true);
  };

  const handleAcceptRequest = (request) => {
    setSelectedRequest(request);
    setShowAcceptModal(true);
  };

  const confirmAcceptRequest = async () => {
    try {
      await acceptFriendRequest(selectedRequest.id);
      setFriendRequests((prev) =>
        prev.filter((req) => req.id !== selectedRequest.id)
      );
      setFriends((prev) => [...prev, selectedRequest]);
      setShowAcceptModal(false);
      setToastMessage(`You are now friends with ${selectedRequest.name}`);
      setShowToast(true);
    } catch (error) {
      setToastMessage(
        error.cause?.message || "Failed to accept friend request"
      );
      setShowToast(true);
    } finally {
      setSelectedRequest(null);
    }
  };

  const handleDeclineRequest = (request) => {
    setSelectedRequest(request);
    setShowDeclineModal(true);
  };

  const confirmDeclineRequest = async () => {
    try {
      await declineFriendRequest(selectedRequest.id);
      setFriendRequests((prev) =>
        prev.filter((req) => req.id !== selectedRequest.id)
      );
      setShowDeclineModal(false);
      setToastMessage(`Friend request from ${selectedRequest.name} declined`);
      setShowToast(true);
    } catch (error) {
      setToastMessage(
        error.cause?.message || "Failed to decline friend request"
      );
      setShowToast(true);
    } finally {
      setSelectedRequest(null);
    }
  };

  const handleRemoveFriend = (friend) => {
    setSelectedFriend(friend);
    setShowRemoveModal(true);
  };

  const confirmRemoveFriend = async () => {
    try {
      await removeFriend(selectedFriend.id);
      setFriends((prev) => prev.filter((f) => f.id !== selectedFriend.id));
      setShowRemoveModal(false);
      setToastMessage(
        `${selectedFriend.name} has been removed from your friends`
      );
      setShowToast(true);
    } catch (error) {
      console.log("Error:", error);
      setToastMessage(error.cause?.message || "Failed to remove friend");
      setShowToast(true);
    } finally {
      setSelectedFriend(null);
    }
  };

  const handleMessage = (friend) => {
    router.push({
      pathname: "/(tabs)/chat",
      params: { name: friend.name },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-2 pb-4 bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-pbold text-gray-900">Friends</Text>
          <TouchableOpacity className="relative">
            <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
              <Ionicons name="person-add" size={22} color="#7C3AED" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="mt-4 flex-row items-center bg-gray-50 rounded-xl p-3">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-700 font-pmedium"
            placeholder="Search friends"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View className="flex-1">
        <View className="px-6 py-4">
          <View className="flex-row mb-4">
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-xl mr-2 ${
                activeTab === "friends"
                  ? "bg-violet-600"
                  : "bg-white border border-violet-600"
              }`}
              onPress={() => setActiveTab("friends")}
            >
              <Text
                className={`font-pmedium text-center ${
                  activeTab === "friends" ? "text-white" : "text-violet-600"
                }`}
              >
                My Friends
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-xl ml-2 ${
                activeTab === "requests"
                  ? "bg-violet-600"
                  : "bg-white border border-violet-600"
              }`}
              onPress={() => setActiveTab("requests")}
            >
              <Text
                className={`font-pmedium text-center ${
                  activeTab === "requests" ? "text-white" : "text-violet-600"
                }`}
              >
                Requests{" "}
                {friendRequests.length > 0 && `(${friendRequests.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6">
            {isLoading ? (
              <View className="flex-1 justify-center items-center py-8">
                <Text className="text-gray-500 font-pmedium">Loading...</Text>
              </View>
            ) : activeTab === "friends" ? (
              friends.length > 0 ? (
                friends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    onViewProfile={handleViewProfile}
                    onRemove={handleRemoveFriend}
                    onMessage={handleMessage}
                  />
                ))
              ) : (
                <View className="flex-1 justify-center items-center py-8">
                  <Text className="text-gray-500 font-pmedium">
                    No friends yet
                  </Text>
                </View>
              )
            ) : friendRequests.length > 0 ? (
              friendRequests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                />
              ))
            ) : (
              <View className="flex-1 justify-center items-center py-8">
                <Text className="text-gray-500 font-pmedium">
                  No friend requests
                </Text>
              </View>
            )}
          </View>
          <View className="h-20" />
        </ScrollView>

        <ProfileModal
          visible={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profile={selectedProfile}
        />

        <RemoveConfirmationModal
          visible={showRemoveModal}
          onClose={() => setShowRemoveModal(false)}
          onConfirm={confirmRemoveFriend}
          friendName={selectedFriend?.name}
        />

        {showAcceptModal && (
          <Modal transparent animationType="fade">
            <View className="flex-1 bg-black/50 justify-center items-center p-6">
              <View className="bg-white rounded-2xl p-6 w-full">
                <Text className="text-lg font-pbold text-[#4a3b6b] mb-4 text-center">
                  Accept Friend Request
                </Text>
                <Text className="text-[#6f5c91] font-pmedium mb-6 text-center">
                  Do you want to accept friend request from{" "}
                  {selectedRequest?.name}?
                </Text>
                <View className="flex-row space-x-4">
                  <TouchableOpacity
                    className="flex-1 bg-[#9f86ff] rounded-xl py-3 m-3"
                    onPress={confirmAcceptRequest}
                  >
                    <Text className="text-white font-pbold text-center">
                      Accept
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-gray-200 rounded-xl py-3 m-3"
                    onPress={() => setShowAcceptModal(false)}
                  >
                    <Text className="text-[#4a3b6b] font-pbold text-center">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {showDeclineModal && (
          <Modal transparent animationType="fade">
            <View className="flex-1 bg-black/50 justify-center items-center p-6">
              <View className="bg-white rounded-2xl p-6 w-full">
                <Text className="text-lg font-pbold text-[#4a3b6b] mb-4 text-center">
                  Decline Friend Request
                </Text>
                <Text className="text-[#6f5c91] font-pmedium mb-6 text-center">
                  Are you sure you want to decline friend request from{" "}
                  {selectedRequest?.name}?
                </Text>
                <View className="flex-row space-x-4">
                  <TouchableOpacity
                    className="flex-1 bg-red-500 rounded-xl py-3 m-3"
                    onPress={confirmDeclineRequest}
                  >
                    <Text className="text-white font-pbold text-center">
                      Decline
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-gray-200 rounded-xl py-3 m-3"
                    onPress={() => setShowDeclineModal(false)}
                  >
                    <Text className="text-[#4a3b6b] font-pbold text-center">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {showToast && (
          <Toast message={toastMessage} onHide={() => setShowToast(false)} />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Friends;
