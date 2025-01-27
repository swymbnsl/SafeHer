import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colours';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NotificationPopup } from './home';


const TripCard = ({ trip, onEdit, refreshTrips }) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigation = useNavigation();

  const handleCancelTrip = async () => {
    try {
      const savedTrips = await AsyncStorage.getItem('trips');
      if (savedTrips) {
        const trips = JSON.parse(savedTrips);
        const updatedTrips = trips.filter(t => t.id !== trip.id);
        await AsyncStorage.setItem('trips', JSON.stringify(updatedTrips));
        setShowCancelModal(false);
        if (refreshTrips) refreshTrips();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel trip');
    }
  };

  const ViewTripModal = () => (
    <Modal
      transparent={true}
      visible={showViewModal}
      animationType="fade"
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-h-[80%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-pbold text-[#4a3b6b]">{trip.name}</Text>
            <TouchableOpacity onPress={() => setShowViewModal(false)}>
              <Ionicons name="close" size={24} color="#4a3b6b" />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            <View className="space-y-4">
              <View>
                <Text className="text-[#6f5c91] font-pmedium">Date & Time</Text>
                <Text className="text-[#4a3b6b] font-psemibold mt-1">
                  {trip.date}, {trip.time}
                </Text>
              </View>
              
              <View>
                <Text className="text-[#6f5c91] font-pmedium">Companions</Text>
                <Text className="text-[#4a3b6b] font-psemibold mt-1">
                  {trip.companions} people joining
                </Text>
              </View>
              
              <View>
                <Text className="text-[#6f5c91] font-pmedium">Description</Text>
                <Text className="text-[#4a3b6b] font-psemibold mt-1">
                  {trip.description || "No description provided"}
                </Text>
              </View>
            </View>
          </ScrollView>
          
          <TouchableOpacity 
            className="bg-[#9f86ff] rounded-xl py-3 mt-6"
            onPress={() => setShowViewModal(false)}
          >
            <Text className="text-white font-pbold text-center">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg border border-[#f0e6ff]">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-psemibold text-[#4a3b6b] flex-1 mr-2">{trip.name}</Text>
        {trip.isPast && (
          <View className="bg-[#f0e6ff] px-3 py-1 rounded-full">
            <Text className="text-[#9f86ff] text-xs font-pmedium">Completed</Text>
          </View>
        )}
      </View>
      <View className="mb-3">
        <Text className="text-[#6f5c91] font-pmedium">{trip.date}, {trip.time}</Text>
        <Text className="text-[#6f5c91] font-pmedium mt-1">{trip.companions} companions</Text>
      </View>
      
      <View className="flex-row mt-2">
        {!trip.isPast && (
          <>
            <TouchableOpacity 
              className="bg-[#9f86ff] rounded-xl px-5 py-2.5 flex-1 mr-3"
              onPress={() => onEdit(trip)}
            >
              <Text className="text-white font-pmedium text-center">Edit Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="border-2 border-[#ff8686] rounded-xl px-5 py-2.5 flex-1"
              onPress={() => setShowCancelModal(true)}
            >
              <Text className="text-[#ff8686] font-pmedium text-center">Cancel Trip</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Cancel Modal */}
      <Modal transparent visible={showCancelModal} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-2xl p-6 w-full">
            <Text className="text-lg font-pbold text-[#4a3b6b] mb-4 text-center">
              Cancel Trip
            </Text>
            <Text className="text-[#6f5c91] font-pmedium mb-6 text-center">
              Are you sure you want to cancel this trip?
            </Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity 
                className="flex-1 bg-[#ff8686] rounded-xl py-3"
                onPress={handleCancelTrip}
              >
                <Text className="text-white font-pbold text-center">Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-gray-200 rounded-xl py-3"
                onPress={() => setShowCancelModal(false)}
              >
                <Text className="text-[#4a3b6b] font-pbold text-center">Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ViewTripModal />
    </View>
  );
};

const Trips = () => {
  const router = useRouter();
  const [trips, setTrips] = useState([]);

  const loadTrips = async () => {
    try {
      const savedTrips = await AsyncStorage.getItem('trips');
      if (savedTrips) {
        setTrips(JSON.parse(savedTrips));
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTrips();
    }, [])
  );

  const handleEditTrip = (trip) => {
    router.push({
      pathname: "/(tabs)/edit_trip",
      params: { tripId: trip.id }
    });
  };

  return (
    <View className="flex-1 bg-[#fff4ff]">
      <View className="flex-row justify-between items-center px-6 pt-14 pb-4">
        <Text className="text-2xl font-pbold text-[#4a3b6b]">My Trips</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="flex-row items-center bg-white rounded-xl p-3 mb-6 shadow-md border border-[#f0e6ff]">
          <Ionicons name="search" size={20} color="#9f86ff" />
          <TextInput
            className="flex-1 ml-3 text-[#4a3b6b] font-pmedium"
            placeholder="Search trips"
            placeholderTextColor="#6f5c91"
          />
        </View>

        <Text className="text-xl font-pbold text-[#4a3b6b] mb-4">My Posted Trips</Text>
        {trips.map((trip, index) => (
          <TripCard
            key={trip.id || index}
            trip={trip}
            onEdit={handleEditTrip}
            refreshTrips={loadTrips}
          />
        ))}
        
        <View className="h-20" />
      </ScrollView>

      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-[#9f86ff] w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 4 }}
        onPress={() => router.push("/(tabs)/new_trip")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Trips;
