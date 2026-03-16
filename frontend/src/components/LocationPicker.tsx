import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { THEME_COLORS } from '../constants/colors';

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  address,
  onLocationChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState(address || '');

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '需要位置权限才能自动获取位置');
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // 逆地理编码获取地址
      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const fullAddress = addressResult
        ? `${addressResult.region || ''}${addressResult.city || ''}${addressResult.district || ''}${addressResult.street || ''}`
        : '';

      onLocationChange(
        location.coords.latitude,
        location.coords.longitude,
        fullAddress
      );
      setManualAddress(fullAddress);
    } catch (error) {
      Alert.alert('获取位置失败', '无法获取当前位置，请手动输入地址');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (text: string) => {
    setManualAddress(text);
    if (latitude && longitude) {
      onLocationChange(latitude, longitude, text);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>位置</Text>
        {latitude && longitude && (
          <Text style={styles.coords}>
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.locationButtonIcon}>📍</Text>
            <Text style={styles.locationButtonText}>自动获取当前位置</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>地址描述</Text>
        <TextInput
          style={styles.addressInput}
          placeholder="请输入详细地址"
          value={manualAddress}
          onChangeText={handleAddressChange}
          multiline
          numberOfLines={2}
        />
      </View>

      {!latitude && !longitude && (
        <Text style={styles.hint}>请先获取位置或输入地址</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  coords: {
    fontSize: 12,
    color: '#6B7280',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  addressContainer: {
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#EF4444',
  },
});
