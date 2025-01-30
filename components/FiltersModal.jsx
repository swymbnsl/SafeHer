import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import FilterOption from "./FilterOption";

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
    <View className="flex-1 justify-end bg-black/50">
      <View className="bg-white rounded-t-3xl p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-pbold text-gray-800">Filters</Text>
          <TouchableOpacity onPress={onReset}>
            <Text className="text-violet-600 font-pmedium">Reset All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="max-h-[70vh]">
          {/* Distance Range Inputs */}
          <View className="mb-6">
            <Text className="text-sm font-pmedium text-gray-600 mb-3">
              Distance Range (km)
            </Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Min Distance</Text>
                <TextInput
                  className="bg-gray-50 rounded-xl p-3 text-gray-800"
                  keyboardType="numeric"
                  value={filters.minDistance}
                  onChangeText={(value) =>
                    handleFilterChange("minDistance", value)
                  }
                  placeholder="0"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Max Distance</Text>
                <TextInput
                  className="bg-gray-50 rounded-xl p-3 text-gray-800"
                  keyboardType="numeric"
                  value={filters.maxDistance}
                  onChangeText={(value) =>
                    handleFilterChange("maxDistance", value)
                  }
                  placeholder="Any"
                />
              </View>
            </View>
          </View>

          {/* Age Range Filter */}
          <View className="mb-6">
            <Text className="text-sm font-pmedium text-gray-600 mb-3">
              Age Range
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                <FilterOption
                  label="Any"
                  selected={filters.ageRange === "any"}
                  onPress={() => handleFilterChange("ageRange", "any")}
                />
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
            </ScrollView>
          </View>
        </ScrollView>

        {/* Updated Buttons Section */}
        <View className="mt-6 flex flex-col gap-3">
          <TouchableOpacity
            className="bg-violet-600 py-4 rounded-xl items-center justify-center"
            onPress={onClose}
            accessibilityLabel="Apply filters"
            accessibilityRole="button"
          >
            <Text className="text-white font-pbold text-base">
              Apply Filters
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-4 items-center justify-center"
            onPress={onClose}
            accessibilityLabel="Cancel filters"
            accessibilityRole="button"
          >
            <Text className="text-gray-600 font-pmedium text-base">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default FiltersModal;
