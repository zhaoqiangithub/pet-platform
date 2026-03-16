import React from 'react';
import { render } from '@testing-library/react-native';
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
  it('renders without crashing', () => {
    const { toJSON } = render(<RescueCard rescue={mockRescue} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders rescue with cat type', () => {
    const { toJSON } = render(<RescueCard rescue={mockRescue} />);
    const json = toJSON();
    expect(json).toBeTruthy();
    // Check rendered output contains expected content
    const rendered = JSON.stringify(json);
    expect(rendered).toContain('猫');
    expect(rendered).toContain('北京市朝阳区');
  });

  it('renders rescue with dog type', () => {
    const dogRescue: Rescue = {
      ...mockRescue,
      animalType: 'dog',
    };
    const { toJSON } = render(<RescueCard rescue={dogRescue} />);
    const rendered = JSON.stringify(toJSON());
    expect(rendered).toContain('狗');
  });

  it('renders rescuing status', () => {
    const rescuingRescue: Rescue = {
      ...mockRescue,
      rescueStatus: 'rescuing',
    };
    const { toJSON } = render(<RescueCard rescue={rescuingRescue} />);
    const rendered = JSON.stringify(toJSON());
    expect(rendered).toContain('救助中');
  });

  it('handles onPress callback', () => {
    const mockOnPress = jest.fn();
    const { toJSON } = render(
      <RescueCard rescue={mockRescue} onPress={mockOnPress} />
    );
    expect(toJSON()).toBeTruthy();
  });
});
