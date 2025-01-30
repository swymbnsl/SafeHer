import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import FilterOption from "./FilterOption";
import InterestTag from "./InterestTag";

const FiltersModal = ({
  visible,
  onClose,
  filters,
  handleFilterChange,
  onReset,
}) => (
  <Modal
    transparent={true}
    visible={visible}
    animationType="slide"
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black/50">
      <View className="bg-white rounded-t-3xl mt-auto p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-pbold text-gray-800">Filters</Text>
          <TouchableOpacity onPress={onReset}>
            <Text className="text-violet-600 font-pmedium">Reset All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="max-h-[70vh]">
          {/* Distance Filter */}
          <View className="mb-6">
            <Text className="text-sm font-pmedium text-gray-600 mb-3">
              Distance
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <FilterOption
                label="< 5km"
                selected={filters.distance === "5km"}
                onPress={() => handleFilterChange("distance", "5km")}
              />
              <FilterOption
                label="5-10km"
                selected={filters.distance === "10km"}
                onPress={() => handleFilterChange("distance", "10km")}
              />
              <FilterOption
                label="10-20km"
                selected={filters.distance === "20km"}
                onPress={() => handleFilterChange("distance", "20km")}
              />
            </View>
          </View>

          {/* Age Range Filter */}
          <View className="mb-6">
            <Text className="text-sm font-pmedium text-gray-600 mb-3">
              Age Range
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <FilterOption
                label="18-25"
                selected={filters.ageRange === "18-25"}
                onPress={() => handleFilterChange("ageRange", "18-25")}
              />
              <FilterOption
                label="26-35"
                selected={filters.ageRange === "26-35"}
                onPress={() => handleFilterChange("ageRange", "26-35")}
              />
              <FilterOption
                label="36+"
                selected={filters.ageRange === "36+"}
                onPress={() => handleFilterChange("ageRange", "36+")}
              />
            </View>
          </View>

          {/* Interests Filter */}
          <View className="mb-6">
            <Text className="text-sm font-pmedium text-gray-600 mb-3">
              Interests
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <InterestTag label="Photography" />
              <InterestTag label="Hiking" />
              <InterestTag label="Food" />
              <InterestTag label="Art" />
              <InterestTag label="Music" />
              <InterestTag label="Sports" />
              <InterestTag label="Travel" />
              <InterestTag label="Reading" />
            </View>
          </View>

          {/* Profession Filter */}
          <View className="mb-6">
            <Text className="text-sm font-pmedium text-gray-600 mb-3">
              Profession
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <FilterOption
                label="Student"
                selected={filters.profession === "student"}
                onPress={() => handleFilterChange("profession", "student")}
              />
              <FilterOption
                label="Professional"
                selected={filters.profession === "professional"}
                onPress={() => handleFilterChange("profession", "professional")}
              />
              <FilterOption
                label="Other"
                selected={filters.profession === "other"}
                onPress={() => handleFilterChange("profession", "other")}
              />
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View className="mt-6 space-y-3">
          <TouchableOpacity
            className="bg-violet-600 py-3.5 rounded-xl"
            onPress={onClose}
          >
            <Text className="text-white font-pbold text-center">
              Apply Filters
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="py-3" onPress={onClose}>
            <Text className="text-gray-600 font-pmedium text-center">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default FiltersModal;
