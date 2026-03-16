import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RescueCard } from '../../src/components/RescueCard';
import type { Rescue } from '../../src/types/rescue';

const mockRescue: Rescue = {
  id: 1,
  userId: 100,
  animalType: 'cat',
  healthStatus: 'healthy',
  rescueStatus: 'pending',
  locationLat: 39.9042,
  locationLng: 116.4074,
  address: '北京市朝阳区',
  description: '一只可爱的流浪猫',
  breed: '中华田园猫',
  age: 'adult',
  contactPhone: '13800138000',
  images: ['https://example.com/cat.jpg'],
  reviewStatus: 'approved',
  createTime: '2024-01-15T10:00:00Z',
  updateTime: '2024-01-15T10:00:00Z',
};

describe('RescueCard', () => {
  it('renders rescue information correctly', () => {
    const { getByText } = render(<RescueCard rescue={mockRescue} />);

    expect(getByText('猫')).toBeTruthy();
    expect(getByText('北京市朝阳区')).toBeTruthy();
    expect(getByText('一只可爱的流浪猫')).toBeTruthy();
  });

  it('displays pending status badge', () => {
    const { getByText } = render(<RescueCard rescue={mockRescue} />);

    expect(getByText('待救助')).toBeTruthy();
  });

  it('calls onPress with correct id when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <RescueCard rescue={mockRescue} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('猫'));

    expect(mockOnPress).toHaveBeenCalledWith(1);
  });

  it('renders placeholder when no images', () => {
    const rescueWithoutImage: Rescue = {
      ...mockRescue,
      images: [],
    };

    const { getByText } = render(<RescueCard rescue={rescueWithoutImage} />);

    expect(getByText('🐱')).toBeTruthy();
  });

  it('displays correct emoji for dog animal type', () => {
    const dogRescue: Rescue = {
      ...mockRescue,
      animalType: 'dog',
    };

    const { getByText } = render(<RescueCard rescue={dogRescue} />);

    expect(getByText('🐕')).toBeTruthy();
  });

  it('displays rescuing status correctly', () => {
    const rescuingRescue: Rescue = {
      ...mockRescue,
      rescueStatus: 'rescuing',
    };

    const { getByText } = render(<RescueCard rescue={rescuingRescue} />);

    expect(getByText('救助中')).toBeTruthy();
  });
});
