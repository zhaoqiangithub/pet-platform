import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MapScreen } from '../../src/screens/MapScreen';

// Mock hooks
jest.mock('../../src/hooks/useMapPoints', () => ({
  useMapPoints: () => ({
    points: [
      {
        id: 1,
        type: 'rescue',
        markerColor: 'red',
        lat: 39.9042,
        lng: 116.4074,
        title: '猫 - 受伤',
        status: 'pending',
        animalType: 'cat',
        createTime: '2024-01-01',
      },
    ],
    loading: false,
    error: null,
    refresh: jest.fn(),
  }),
  useHeatmap: () => ({
    heatmapPoints: [],
    loading: false,
    error: null,
    refresh: jest.fn(),
  }),
}));

describe('MapScreen', () => {
  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<MapScreen navigation={navigation} />);

    // Should show map placeholder
    expect(getByText('🗺️ 地图区域')).toBeTruthy();

    // Should show legend
    expect(getByText('紧急救助')).toBeTruthy();
    expect(getByText('需要救助')).toBeTruthy();
    expect(getByText('待领养')).toBeTruthy();
    expect(getByText('已完成')).toBeTruthy();
  });

  it('shows filter buttons', () => {
    const { getByText } = render(<MapScreen navigation={navigation} />);

    // Should show type filter buttons
    expect(getByText('全部')).toBeTruthy();
    expect(getByText('救助')).toBeTruthy();
    expect(getByText('领养')).toBeTruthy();

    // Should show radius filter buttons
    expect(getByText('1km')).toBeTruthy();
    expect(getByText('5km')).toBeTruthy();
    expect(getByText('10km')).toBeTruthy();
  });

  it('toggles heatmap mode', () => {
    const { getByText } = render(<MapScreen navigation={navigation} />);

    // Click heatmap button
    const heatmapButton = getByText('🔥 热力');
    fireEvent.press(heatmapButton);

    // Should show marker button now
    expect(getByText('🏠 标记')).toBeTruthy();
  });

  it('shows FAB button', () => {
    const { getByText } = render(<MapScreen navigation={navigation} />);

    // Should show add button
    expect(getByText('+')).toBeTruthy();
  });
});
