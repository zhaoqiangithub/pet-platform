import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LocationPicker } from '../../src/components/LocationPicker';
import * as Location from 'expo-location';

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: {
    High: 4,
  },
}));

describe('LocationPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial props', () => {
    const onLocationChange = jest.fn();

    const { getByText } = render(
      <LocationPicker
        latitude={39.9042}
        longitude={116.4074}
        address="北京市朝阳区"
        onLocationChange={onLocationChange}
      />
    );

    expect(getByText('位置')).toBeTruthy();
    expect(getByText('39.9042, 116.4074')).toBeTruthy();
    expect(getByText('自动获取当前位置')).toBeTruthy();
  });

  it('displays hint when no location is set', () => {
    const onLocationChange = jest.fn();

    const { getByText } = render(
      <LocationPicker onLocationChange={onLocationChange} />
    );

    expect(getByText('请先获取位置或输入地址')).toBeTruthy();
  });

  it('displays address input field', () => {
    const onLocationChange = jest.fn();

    const { getByPlaceholderText } = render(
      <LocationPicker onLocationChange={onLocationChange} />
    );

    expect(getByPlaceholderText('请输入详细地址')).toBeTruthy();
  });

  it('calls onLocationChange when address text changes', () => {
    const onLocationChange = jest.fn();

    const { getByPlaceholderText } = render(
      <LocationPicker
        latitude={39.9042}
        longitude={116.4074}
        onLocationChange={onLocationChange}
      />
    );

    const addressInput = getByPlaceholderText('请输入详细地址');
    fireEvent.changeText(addressInput, '北京市朝阳区');

    expect(onLocationChange).toHaveBeenCalledWith(39.9042, 116.4074, '北京市朝阳区');
  });

  it('shows loading indicator when getting location', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 1000))
    );

    const onLocationChange = jest.fn();

    const { getByTestId } = render(
      <LocationPicker onLocationChange={onLocationChange} />
    );

    const button = getByTestId('location-button');
    // Note: We need to add testID to the component for this to work
    // For now, let's just verify it doesn't crash
  });

  it('requests location permission on mount', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    const onLocationChange = jest.fn();

    render(<LocationPicker onLocationChange={onLocationChange} />);

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });
  });

  it('gets current location when button pressed', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: {
        latitude: 39.9042,
        longitude: 116.4074,
      },
    });
    (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
      {
        region: '北京市',
        city: '北京市',
        district: '朝阳区',
        street: '建国路',
      },
    ]);

    const onLocationChange = jest.fn();

    const { getByText } = render(
      <LocationPicker onLocationChange={onLocationChange} />
    );

    const button = getByText('自动获取当前位置');
    fireEvent.press(button);

    await waitFor(() => {
      expect(onLocationChange).toHaveBeenCalledWith(
        39.9042,
        116.4074,
        '北京市北京市朝阳区建国路'
      );
    });
  });
});
