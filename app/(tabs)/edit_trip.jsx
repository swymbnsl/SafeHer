import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parse } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '../components/Toast';

const EditTrip = () => {
  const router = useRouter();
  const { tripId } = useLocalSearchParams();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [tripData, setTripData] = useState({
    id: '',
    name: '',
    date: new Date(),
    time: new Date(),
    companions: '',
    description: '',
  });

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  const loadTripData = async () => {
    try {
      const savedTrips = await AsyncStorage.getItem('trips');
      if (savedTrips) {
        const trips = JSON.parse(savedTrips);
        const trip = trips.find(t => t.id === tripId);
        if (trip) {
          setTripData({
            ...trip,
            date: new Date(),  // Set to current date initially
            time: new Date(),  // Set to current time initially
            companions: String(trip.companions)
          });
        }
      }
    } catch (error) {
      console.error('Failed to load trip:', error);
      setError('Failed to load trip data');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || tripData.date;
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTripData(prev => ({...prev, date: currentDate}));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || tripData.time;
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTripData(prev => ({...prev, time: currentTime}));
    }
  };

  const handleUpdateTrip = () => {
    if (!tripData.name || !tripData.companions) {
      setError('Please fill in all required fields');
      return;
    }
    setShowConfirm(true);
  };

  const confirmUpdateTrip = async () => {
    try {
      const savedTrips = await AsyncStorage.getItem('trips');
      let trips = savedTrips ? JSON.parse(savedTrips) : [];
      
      const updatedTrips = trips.map(trip => 
        trip.id === tripId ? {
          ...trip,
          ...tripData,
          date: format(tripData.date, 'do MMMM yyyy'),
          time: format(tripData.time, 'h:mm a'),
        } : trip
      );
      
      await AsyncStorage.setItem('trips', JSON.stringify(updatedTrips));
      setShowConfirm(false);
      setToastMessage('Trip updated successfully!');
      setShowToast(true);
      setTimeout(() => {
        router.replace('/(tabs)/trips');
      }, 1500);
    } catch (error) {
      console.error('Update error:', error);
      setError('Failed to update trip');
    }
  };

  return (
    <View className="flex-1 bg-[#fff4ff]">
      <View className="flex-row justify-between items-center px-6 pt-14 pb-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#4a3b6b" />
          <Text className="text-xl font-pbold text-[#4a3b6b] ml-2">Edit Trip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg border border-[#f0e6ff]">
          {error ? (
            <Text className="text-red-500 mb-4 font-pmedium">{error}</Text>
          ) : null}
          
          <Text className="text-[#6f5c91] font-pmedium mb-2">Trip Name</Text>
          <TextInput
            className="bg-[#fff4ff] rounded-xl p-3 text-[#4a3b6b] font-pmedium mb-4"
            value={tripData.name}
            onChangeText={(text) => setTripData({...tripData, name: text})}
          />

          <Text className="text-[#6f5c91] font-pmedium mb-2">Date</Text>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            className="bg-[#fff4ff] rounded-xl p-3 mb-4"
          >
            <Text className="text-[#4a3b6b] font-pmedium">
              {format(new Date(tripData.date), 'do MMMM yyyy')}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(tripData.date)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          <Text className="text-[#6f5c91] font-pmedium mb-2">Time</Text>
          <TouchableOpacity 
            onPress={() => setShowTimePicker(true)}
            className="bg-[#fff4ff] rounded-xl p-3 mb-4"
          >
            <Text className="text-[#4a3b6b] font-pmedium">
              {format(new Date(tripData.time), 'h:mm a')}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={new Date(tripData.time)}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}

          <Text className="text-[#6f5c91] font-pmedium mb-2">Number of Companions</Text>
          <TextInput
            className="bg-[#fff4ff] rounded-xl p-3 text-[#4a3b6b] font-pmedium mb-4"
            keyboardType="numeric"
            value={String(tripData.companions)}
            onChangeText={(text) => setTripData({...tripData, companions: text})}
          />

          <Text className="text-[#6f5c91] font-pmedium mb-2">Description</Text>
          <TextInput
            className="bg-[#fff4ff] rounded-xl p-3 text-[#4a3b6b] font-pmedium mb-6"
            multiline
            numberOfLines={4}
            value={tripData.description}
            onChangeText={(text) => setTripData({...tripData, description: text})}
          />

          <TouchableOpacity 
            className="bg-[#9f86ff] rounded-xl py-4 items-center"
            onPress={handleUpdateTrip}
          >
            <Text className="text-white font-pbold text-lg">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showConfirm && (
        <Modal transparent animationType="fade">
          <View className="flex-1 bg-black/50 justify-center items-center p-6">
            <View className="bg-white rounded-2xl p-6 w-full">
              <Text className="text-lg font-pbold text-[#4a3b6b] mb-4 text-center">
                Confirm Trip Update
              </Text>
              <Text className="text-[#6f5c91] font-pmedium mb-6 text-center">
                Are you sure you want to update this trip?
              </Text>
              <View className="flex-row space-x-4">
                <TouchableOpacity 
                  className="flex-1 bg-[#9f86ff] rounded-xl py-3 m-3"
                  onPress={confirmUpdateTrip}
                >
                  <Text className="text-white font-pbold text-center">Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-1 bg-gray-200 rounded-xl py-3 m-3"
                  onPress={() => setShowConfirm(false)}
                >
                  <Text className="text-[#4a3b6b] font-pbold text-center">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showToast && (
        <Toast 
          message={toastMessage} 
          onHide={() => setShowToast(false)} 
        />
      )}
    </View>
  );
};

export default EditTrip; 